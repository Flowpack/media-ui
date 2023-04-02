<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Domain\Model\AssetSource;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Doctrine\ORM\EntityManagerInterface;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\ObjectManagement\ObjectManagerInterface;
use Neos\Flow\Persistence\Exception\InvalidQueryException;
use Neos\Flow\Persistence\QueryInterface;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\AssetSource\AssetNotFoundExceptionInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryResultInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyRepositoryInterface;
use Neos\Media\Domain\Model\AssetSource\AssetTypeFilter;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetNotFoundException;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetProxy;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetProxyQueryResult;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetSource;
use Neos\Media\Domain\Model\AssetSource\SupportsCollectionsInterface;
use Neos\Media\Domain\Model\AssetSource\SupportsSortingInterface;
use Neos\Media\Domain\Model\AssetSource\SupportsTaggingInterface;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Domain\Repository\AudioRepository;
use Neos\Media\Domain\Repository\DocumentRepository;
use Neos\Media\Domain\Repository\ImageRepository;
use Neos\Media\Domain\Repository\VideoRepository;

/**
 * This is a copy of the NeosAssetProxyRepository from the Neos.Media package
 * but with some additional methods to support the Flowpack.Media.Ui package.
 */
final class NeosAssetProxyRepository implements AssetProxyRepositoryInterface, SupportsSortingInterface,
                                                SupportsCollectionsInterface, SupportsTaggingInterface
{
    /**
     * @Flow\Inject
     * @var ObjectManagerInterface
     */
    protected $objectManager;

    /**
     * @Flow\Inject
     * @var EntityManagerInterface
     */
    protected $entityManager;

    /**
     * @var NeosAssetSource
     */
    private $assetSource;

    /**
     * @var AssetRepository
     */
    private $assetRepository;

    /**
     * @var AssetCollection
     */
    private $activeAssetCollection;

    private string $assetTypeFilter = 'All';

    private array $assetRepositoryClassNames = [
        'All' => AssetRepository::class,
        'Image' => ImageRepository::class,
        'Document' => DocumentRepository::class,
        'Video' => VideoRepository::class,
        'Audio' => AudioRepository::class
    ];

    public function __construct(NeosAssetSource $assetSource)
    {
        $this->assetSource = $assetSource;
    }

    public function initializeObject(): void
    {
        /** @var AssetRepository $assetRepositoryForType */
        $assetRepositoryForType = $this->objectManager->get($this->assetRepositoryClassNames[$this->assetTypeFilter]);
        $this->assetRepository = $assetRepositoryForType;
    }

    /**
     * Sets the property names to order results by. Expected like this:
     * array(
     *  'foo' => \Neos\Flow\Persistence\QueryInterface::ORDER_ASCENDING,
     *  'bar' => \Neos\Flow\Persistence\QueryInterface::ORDER_DESCENDING
     * )
     *
     * @param array $orderings The property names to order by by default
     * @api
     */
    public function orderBy(array $orderings): void
    {
        $this->assetRepository->setDefaultOrderings($orderings);
    }

    public function filterByType(AssetTypeFilter $assetType = null): void
    {
        $this->assetTypeFilter = (string)$assetType ?: 'All';
        $this->initializeObject();
    }

    /**
     * NOTE: This needs to be refactored to use an asset collection identifier instead of Media's domain model before
     *       it can become a public API for other asset sources.
     */
    public function filterByCollection(AssetCollection $assetCollection = null): void
    {
        $this->activeAssetCollection = $assetCollection;
    }

    /**
     * @throws AssetNotFoundExceptionInterface
     */
    public function getAssetProxy(string $identifier): AssetProxyInterface
    {
        $asset = $this->assetRepository->findByIdentifier($identifier);
        if (!$asset instanceof AssetInterface) {
            throw new NeosAssetNotFoundException('The specified asset was not found.', 1509632861);
        }
        return new NeosAssetProxy($asset, $this->assetSource);
    }

    public function findAll(): AssetProxyQueryResultInterface
    {
        $queryResult = $this->assetRepository->findAll($this->activeAssetCollection);
        $query = $this->filterOutImportedAssetsFromOtherAssetSources($queryResult->getQuery());
        $query = $this->filterOutImageVariants($query);
        return new NeosAssetProxyQueryResult($query->execute(), $this->assetSource);
    }

    public function findBySearchTerm(string $searchTerm): AssetProxyQueryResultInterface
    {
        $queryResult = $this->assetRepository->findBySearchTermOrTags($searchTerm, [], $this->activeAssetCollection);
        $query = $this->filterOutImportedAssetsFromOtherAssetSources($queryResult->getQuery());
        $query = $this->filterOutImageVariants($query);
        return new NeosAssetProxyQueryResult($query->execute(), $this->assetSource);
    }

    public function findByTag(Tag $tag): AssetProxyQueryResultInterface
    {
        $queryResult = $this->assetRepository->findByTag($tag, $this->activeAssetCollection);
        $query = $this->filterOutImportedAssetsFromOtherAssetSources($queryResult->getQuery());
        $query = $this->filterOutImageVariants($query);
        return new NeosAssetProxyQueryResult($query->execute(), $this->assetSource);
    }

    public function findUntagged(): AssetProxyQueryResultInterface
    {
        $queryResult = $this->assetRepository->findUntagged($this->activeAssetCollection);
        $query = $this->filterOutImportedAssetsFromOtherAssetSources($queryResult->getQuery());
        $query = $this->filterOutImageVariants($query);
        return new NeosAssetProxyQueryResult($query->execute(), $this->assetSource);
    }

    /**
     * @return AssetProxyQueryResultInterface
     */
    public function findUnassigned(): AssetProxyQueryResultInterface
    {
        $query = $this->assetRepository->createQuery();
        $query = $this->filterOutImportedAssetsFromOtherAssetSources($query);
        $query = $this->filterOutAssetsWithAssetCollections($query);
        $query = $this->filterOutImageVariants($query);
        return new NeosAssetProxyQueryResult($query->execute(), $this->assetSource);
    }

    public function countAll(): int
    {
        $query = $this->filterOutImportedAssetsFromOtherAssetSources($this->assetRepository->createQuery());
        $query = $this->filterOutAssetsFromOtherAssetCollections($query);
        $query = $this->filterOutImageVariants($query);
        return $query->count();
    }

    public function countUntagged(): int
    {
        $query = $this->assetRepository->createQuery();
        try {
            $query->matching($query->isEmpty('tags'));
        } catch (InvalidQueryException $e) {
        }

        $query = $this->filterOutImportedAssetsFromOtherAssetSources($query);
        $query = $this->filterOutAssetsFromOtherAssetCollections($query);
        $query = $this->filterOutImageVariants($query);
        return $query->count();
    }

    public function countByTag(Tag $tag): int
    {
        $queryResult = $this->assetRepository->findByTag($tag, $this->activeAssetCollection);
        $query = $this->filterOutImportedAssetsFromOtherAssetSources($queryResult->getQuery());
        $query = $this->filterOutImageVariants($query);
        return $query->count();
    }

    private function filterOutImportedAssetsFromOtherAssetSources(QueryInterface $query): QueryInterface
    {
        $constraint = $query->getConstraint();
        $query->matching(
            $query->logicalAnd([
                $constraint,
                $query->equals('assetSourceIdentifier', 'neos')
            ])
        );
        return $query;
    }

    private function filterOutImageVariants(QueryInterface $query): QueryInterface
    {
        $queryBuilder = $query->getQueryBuilder();
        $queryBuilder->andWhere('e NOT INSTANCE OF Neos\Media\Domain\Model\ImageVariant');
        return $query;
    }

    private function filterOutAssetsFromOtherAssetCollections(QueryInterface $query): QueryInterface
    {
        $constraints = $query->getConstraint();
        try {
            $query->matching(
                $query->logicalAnd([
                    $constraints,
                    $query->contains('assetCollections', $this->activeAssetCollection)
                ])
            );
        } catch (InvalidQueryException $e) {
        }
        return $query;
    }

    private function filterOutAssetsWithAssetCollections(QueryInterface $query): QueryInterface
    {
        $constraints = $query->getConstraint();
        try {
            $query->matching(
                $query->logicalAnd([
                    $constraints,
                    $query->isEmpty('assetCollections')
                ])
            );
        } catch (InvalidQueryException $e) {
        }
        return $query;
    }
}
