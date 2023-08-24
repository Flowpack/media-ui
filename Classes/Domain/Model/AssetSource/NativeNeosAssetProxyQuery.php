<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Domain\Model\AssetSource;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\Query\ResultSetMapping;
use Doctrine\ORM\Query\ResultSetMappingBuilder;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\Doctrine\Mapping\Driver\FlowAnnotationDriver;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Flow\Reflection\ReflectionService;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryResultInterface;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetSource;
use Neos\Media\Domain\Model\AssetVariantInterface;
use Neos\Media\Domain\Model\Tag;

class NativeNeosAssetProxyQuery implements AssetProxyQueryInterface
{

    /**
     * @var NeosAssetProxyRepository
     */
    protected $neosAssetProxyRepository;
    private NeosAssetSource $assetSource;
    private int $limit = 0;
    private int $offset = 0;
    private string $searchTerm = '';
    private string $entityClassName;
    private array $filters;
    private array $joins = [];
    protected array $parameters = [];

    /**
     * @Flow\Inject
     * @var ReflectionService
     */
    protected $reflectionService;

    /**
     * @Flow\Inject
     * @var EntityManagerInterface
     */
    protected $entityManager;

    /**
     * @Flow\Inject
     * @var PersistenceManagerInterface
     */
    protected $persistenceManager;

    public function __construct(NeosAssetProxyRepository $neosAssetProxyRepository, NeosAssetSource $assetSource, string $entityClassName)
    {
        $this->neosAssetProxyRepository = $neosAssetProxyRepository;
        $this->assetSource = $assetSource;
        $this->entityClassName = $entityClassName;

        $this->filters = [
            'assetSource' => 'assetSourceIdentifier = "' . $this->assetSource->getIdentifier() . '"',
        ];
    }

    public function setOffset(int $offset): void
    {
        $this->offset = $offset;
    }

    public function getOffset(): int
    {
        return $this->offset;
    }

    public function setLimit(int $limit): void
    {
        $this->limit = $limit;
    }

    public function getLimit(): int
    {
        return $this->limit;
    }

    public function setSearchTerm(string $searchTerm): void
    {
        $this->searchTerm = strtolower(trim($searchTerm));

        if ($this->searchTerm) {
            $this->filters['searchTerm'] = '
                LOWER(a.title) LIKE :searchTerm
                OR LOWER(a.caption) LIKE :searchTerm
                OR LOWER(r.filename) LIKE :searchTerm
            ';
            $this->joins['resource'] = '
                JOIN neos_flow_resourcemanagement_persistentresource r
                    ON r.persistence_object_identifier = a.resource';

            $this->parameters['searchTerm'] = '%' . $this->searchTerm . '%';
        } elseif (isset($this->parameters['searchTerm'])) {
            unset($this->parameters['searchTerm']);
        }
    }

    public function withSearchTerm(string $searchTerm): self
    {
        $this->setSearchTerm($searchTerm);
        return $this;
    }

    public function getSearchTerm(): string
    {
        return $this->searchTerm;
    }

    public function execute(): AssetProxyQueryResultInterface
    {
        $limit = $this->limit ? 'LIMIT ' . $this->limit : '';
        $offset = $this->offset ? 'OFFSET ' . $this->offset : '';
        $this->filters['assetVariants'] = $this->getAssetVariantFilterClauseForDql();

        $rsm = new ResultSetMappingBuilder($this->entityManager);
        $rsm->addEntityResult(Asset::class, 'a');
        $rsm->addMetaResult('a', 'persistence_object_identifier', 'persistence_object_identifier', false);
        $selectClause = $rsm->generateSelectClause(['a' => 'a']);

        $queryString = sprintf('
            SELECT %s
            FROM neos_media_domain_model_asset a
            %s
            WHERE %s
            %s %s
        ',
            $selectClause,
            implode(' ', array_values($this->joins)),
            implode(' AND ', array_values($this->filters)),
            $limit,
            $offset
        );
        $query = $this->entityManager->createNativeQuery($queryString, $rsm);
        $query->setParameters($this->parameters);

        $assetIds = $query->getSingleColumnResult();

        $assets = $this->neosAssetProxyRepository->getAssetProxies($assetIds);

//        \Neos\Flow\var_dump($query->getSQL(), 'sql');
//        \Neos\Flow\var_dump($assetIds, 'asset ids');
//        \Neos\Flow\var_dump($assets, 'assets');
//        die('foo');
        return new NativeNeosAssetProxyQueryResult($this, $assets, $this->assetSource);
    }

    public function count(): int
    {
        $this->filters['assetVariants'] = $this->getAssetVariantFilterClauseForDql();

        $queryString = sprintf('
            SELECT count(a.persistence_object_identifier) c
            FROM neos_media_domain_model_asset a
            %s
            WHERE %s
        ',
            implode(' ', array_values($this->joins)),
            implode(' AND ', array_values($this->filters))
        );

        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('c', 'c');
        $query = $this->entityManager->createNativeQuery($queryString, $rsm);
        $query->setParameters($this->parameters);

        try {
            return (int)$query->getSingleScalarResult();
        } catch (NonUniqueResultException $e) {
            return 0;
        }
    }

    protected function getAssetVariantFilterClauseForDql(): string
    {
        if ($this->entityClassName === Asset::class) {
            $variantClassNames = $this->reflectionService->getAllImplementationClassNamesForInterface(AssetVariantInterface::class);
            $discriminatorTypes = array_map(
                [FlowAnnotationDriver::class, 'inferDiscriminatorTypeFromClassName'],
                $variantClassNames
            );

            return sprintf("a.dtype NOT IN('%s')", implode("','", $discriminatorTypes));
        }

        return sprintf(
            "dtype = '%s'",
            strtolower(str_replace('Domain_Model_', '', str_replace('\\', '_', $this->entityClassName)))
        );
    }

    public function withAssetCollection(AssetCollection $activeAssetCollection): self
    {
        $this->joins['assetCollection'] = '
            JOIN neos_media_domain_model_assetcollection_assets_join ac
                ON ac.media_asset = a.persistence_object_identifier
                    AND ac.media_assetcollection = :assetCollection';
        $this->parameters['assetCollection'] = $this->persistenceManager->getIdentifierByObject($activeAssetCollection);
        return $this;
    }

    public function withoutAssetCollections(): self
    {
        $this->joins['assetCollection'] = '
            LEFT OUTER JOIN neos_media_domain_model_assetcollection_assets_join ac
                ON ac.media_asset = a.persistence_object_identifier';
        $this->filters['assetCollection'] = 'ac.media_asset IS NULL';
        return $this;
    }

    public function withTag(?Tag $activeTag): self
    {
        $this->joins['tag'] = '
            JOIN neos_media_domain_model__asset_tags_join ac
                ON ac.media_asset = a.persistence_object_identifier
                    AND ac.media_tag = :tag';
        $this->parameters['tag'] = $this->persistenceManager->getIdentifierByObject($activeTag);
        return $this;
    }

    public function withoutTags(): self
    {
        $this->joins['tag'] = '
            LEFT OUTER JOIN neos_media_domain_model__asset_tags_join ac
                ON ac.media_asset = a.persistence_object_identifier';
        $this->filters['tag'] = 'ac.media_asset IS NULL';
        return $this;
    }

    public function withMediaType(string $mediaType): self
    {
        $this->filters['mediaType'] = 'r.mediaType = :mediaType';
        $this->parameters['mediaType'] = $mediaType;
        $this->joins['resource'] = '
            JOIN neos_flow_resourcemanagement_persistentresource r
                ON r.persistence_object_identifier = a.resource';
        return $this;
    }
}
