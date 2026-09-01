<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Infrastructure\Neos\Media;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query;
use Doctrine\ORM\QueryBuilder;
use Neos\Flow\ObjectManagement\ObjectManagerInterface;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetSource;
use Neos\Media\Domain\Model\Audio;
use Neos\Media\Domain\Model\Document;
use Neos\Media\Domain\Model\Image;
use Neos\Media\Domain\Model\ImageVariant;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Model\Video;
use Neos\MetaData\Domain\Dto\MetaDataAssetFilter;
use Neos\MetaData\MetaDataManager;

/**
 * Builds and executes the Doctrine ORM queries for the Neos asset source.
 *
 * This is the extracted query related part of the NeosAssetProxyRepository. It
 * holds the active filter state and constructs \Doctrine\ORM\Query objects
 * (a select and a separate count query) directly, without Flow's persistence
 * QueryInterface.
 */
final class NeosAssetProxyQuery
{
    const string ASSET_SOURCE_IDENTIFIER = 'neos';

    private ?MetaDataManager $metaDataManager = null;

    private ?AssetCollection $activeAssetCollection = null;
    private ?Tag $activeTag = null;

    private string $assetTypeFilter = 'All';
    private string $mediaTypeFilter = '';
    private bool $filterAssetsInCollections = false;
    private bool $filterAssetsWithTags = false;

    private array $orderings = [];

    private array $entityClassNames = [
        'All' => Asset::class,
        'Image' => Image::class,
        'Document' => Document::class,
        'Video' => Video::class,
        'Audio' => Audio::class,
    ];

    public function __construct(
        private readonly ObjectManagerInterface $objectManager,
        private readonly EntityManagerInterface $entityManager,
        private readonly NeosAssetSource $assetSource,
    ) {
    }

    public function setAssetType(string $assetType): void
    {
        $this->assetTypeFilter = $assetType !== '' ? $assetType : 'All';
    }

    public function setMediaType(string $mediaType): void
    {
        $this->mediaTypeFilter = $mediaType;
    }

    public function setAssetCollection(?AssetCollection $assetCollection): void
    {
        $this->activeAssetCollection = $assetCollection;
    }

    public function setTag(?Tag $tag): void
    {
        $this->activeTag = $tag;
    }

    public function setFilterAssetsInCollections(bool $filter): void
    {
        $this->filterAssetsInCollections = $filter;
    }

    public function setFilterAssetsWithTags(bool $filter): void
    {
        $this->filterAssetsWithTags = $filter;
    }

    /**
     * @param array<string, string> $orderings
     */
    public function setOrderings(array $orderings): void
    {
        $this->orderings = $orderings;
    }

    public function findAll(): NeosAssetProxyQueryResult
    {
        return $this->buildResult();
    }

    public function findBySearchTerm(string $searchTerm): NeosAssetProxyQueryResult
    {
        if ($this->getMetaDataManager() !== null) {
            return $this->findByMetaDataSearchTerm($searchTerm);
        }

        return $this->buildResult(function (QueryBuilder $qb) use ($searchTerm): void {
            $this->joinResource($qb);
            $qb->andWhere(
                '(a.title LIKE :searchTerm OR a.caption LIKE :searchTerm OR resource.filename LIKE :searchTerm)'
            );
            $qb->setParameter('searchTerm', '%' . $searchTerm . '%');
        });
    }

    public function findByTag(Tag $tag): NeosAssetProxyQueryResult
    {
        $this->activeTag = $tag;
        return $this->buildResult();
    }

    public function findUntagged(): NeosAssetProxyQueryResult
    {
        $this->filterAssetsWithTags = true;
        return $this->buildResult();
    }

    public function countAll(): int
    {
        return (int)$this->buildCountQuery()->getSingleScalarResult();
    }

    public function countUntagged(): int
    {
        $this->filterAssetsWithTags = true;
        return (int)$this->buildCountQuery()->getSingleScalarResult();
    }

    public function countByTag(Tag $tag): int
    {
        $this->activeTag = $tag;
        return (int)$this->buildCountQuery()->getSingleScalarResult();
    }

    /**
     * Searches the asset metadata (if the Neos.MetaData package is installed) instead of the asset
     * properties, and resolves the matching asset references back to asset proxies.
     */
    private function findByMetaDataSearchTerm(string $searchTerm): NeosAssetProxyQueryResult
    {
        $identifiers = [];
        foreach ($this->getMetaDataManager()->findAssets(
            MetaDataAssetFilter::create(assetSourceId: self::ASSET_SOURCE_IDENTIFIER, searchTerm: $searchTerm)
        ) as $assetReference) {
            $identifiers[] = $assetReference->assetId;
        }

        return $this->buildResult(static function (QueryBuilder $qb) use ($identifiers): void {
            if ($identifiers !== []) {
                $qb->andWhere('a.Persistence_Object_Identifier IN (:identifiers)');
                $qb->setParameter('identifiers', $identifiers);
            } else {
                $qb->andWhere('a.Persistence_Object_Identifier = :none');
                $qb->setParameter('none', '__none__');
            }
        });
    }

    private function getMetaDataManager(): ?MetaDataManager
    {
        if ($this->metaDataManager === null && $this->objectManager->has(MetaDataManager::class)) {
            $this->metaDataManager = $this->objectManager->get(MetaDataManager::class);
        }

        return $this->metaDataManager;
    }

    public function getEntityClassName(): string
    {
        return $this->entityClassNames[$this->assetTypeFilter] ?? Asset::class;
    }

    private function applyOrderings(QueryBuilder $qb): void
    {
        foreach ($this->orderings as $field => $direction) {
            if ($field === 'lastModified') {
                $qb->addOrderBy('a.lastModified', $direction);
                continue;
            }

            if (str_starts_with($field, 'resource.')) {
                $this->joinResource($qb);
                $qb->addOrderBy('resource.' . substr($field, strlen('resource.')), $direction);
                continue;
            }

            $qb->addOrderBy('a.' . $field, $direction);
        }
    }

    private function applyFilters(QueryBuilder $qb): void
    {
        $qb->andWhere('a.assetSourceIdentifier = :assetSourceIdentifier');
        $qb->setParameter('assetSourceIdentifier', self::ASSET_SOURCE_IDENTIFIER);

        $qb->andWhere('a NOT INSTANCE OF ' . ImageVariant::class);

        if ($this->filterAssetsInCollections) {
            $qb->andWhere('a.assetCollections IS EMPTY');
        } elseif ($this->activeAssetCollection !== null) {
            $qb->andWhere(':activeAssetCollection MEMBER OF a.assetCollections');
            $qb->setParameter('activeAssetCollection', $this->activeAssetCollection);
        }

        if ($this->activeTag !== null) {
            $qb->andWhere(':activeTag MEMBER OF a.tags');
            $qb->setParameter('activeTag', $this->activeTag);
        } elseif ($this->filterAssetsWithTags) {
            $qb->andWhere('a.tags IS EMPTY');
        }

        if ($this->mediaTypeFilter !== '') {
            $this->joinResource($qb);
            $qb->andWhere('resource.mediaType = :mediaType');
            $qb->setParameter('mediaType', $this->mediaTypeFilter);
        }
    }

    private function joinResource(QueryBuilder $qb): void
    {
        foreach ($qb->getDQLPart('join') as $joins) {
            foreach ($joins as $join) {
                if ($join->getAlias() === 'resource') {
                    return;
                }
            }
        }

        $qb->join('a.resource', 'resource');
    }

    private function buildCountQuery(?callable $additionalCriteria = null): Query
    {
        $qb = $this->entityManager->createQueryBuilder();
        $qb->select('count(a)')->from($this->getEntityClassName(), 'a');

        $this->applyFilters($qb);

        if ($additionalCriteria !== null) {
            $additionalCriteria($qb);
        }

        return $qb->getQuery();
    }

    private function buildResult(?callable $additionalCriteria = null): NeosAssetProxyQueryResult
    {
        $qb = $this->entityManager->createQueryBuilder();
        $qb->select('a')->from($this->getEntityClassName(), 'a');

        $this->applyFilters($qb);
        if ($additionalCriteria !== null) {
            $additionalCriteria($qb);
        }
        $this->applyOrderings($qb);

        return new NeosAssetProxyQueryResult(
            $qb->getQuery(),
            $this->buildCountQuery($additionalCriteria),
            $this->assetSource,
        );
    }
}
