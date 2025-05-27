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
use Neos\Media\Domain\Model\ImageVariant;
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
     * @var ObjectManagerInterface
     */
    #[Flow\Inject]
    protected $objectManager;

    /**
     * @var EntityManagerInterface
     */
    #[Flow\Inject]
    protected $entityManager;

    /**
     * @var NeosAssetSource
     */
    private $assetSource;

    /**
     * @var AssetRepository
     */
    private $assetRepository;

    private ?AssetCollection $activeAssetCollection = null;
    protected ?Tag $activeTag = null;

    private string $assetTypeFilter = 'All';
    private string $mediaTypeFilter = '';
    private bool $filterAssetsInCollections = false;
    private bool $filterAssetsWithTags = false;

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

    public function filterByMediaType(string $mediaType): void
    {
        $this->mediaTypeFilter = $mediaType;
    }

    /**
     * NOTE: This needs to be refactored to use an asset collection identifier instead of Media's domain model before
     *       it can become a public API for other asset sources.
     */
    public function filterByCollection(AssetCollection $assetCollection = null): void
    {
        $this->activeAssetCollection = $assetCollection;
    }

    public function filterByTag(Tag $tag): void
    {
        $this->activeTag = $tag;
    }

    private function filterQuery(QueryInterface $query, bool $filterOtherCollections = false): QueryInterface
    {
        $query = $this->filterOutImportedAssetsFromOtherAssetSources($query);
        $query = $this->filterOutImageVariants($query);

        if ($filterOtherCollections) {
            $query = $this->filterOutAssetsFromOtherAssetCollections($query);
        } elseif ($this->filterAssetsInCollections) {
            $query = $this->filterOutAssetsWithAssetCollections($query);
        }

        if ($this->activeTag) {
            $query = $this->filterOutAssetsWithoutActiveTag($query);
        } else if ($this->filterAssetsWithTags) {
            $query = $this->filterOutAssetsWithTags($query);
        }

        if ($this->mediaTypeFilter) {
            $query = $this->filterOutAssetsWithOtherMediaTypes($query);
        }
        return $query;
    }

    /**
     * @throws NeosAssetNotFoundException
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
        $query = $this->filterQuery($this->assetRepository->findAll($this->activeAssetCollection)->getQuery());
        return new NeosAssetProxyQueryResult($query->execute(), $this->assetSource);
    }

    public function findBySearchTerm(string $searchTerm): AssetProxyQueryResultInterface
    {
        $query = $this->filterQuery($this->assetRepository->findBySearchTermOrTags($searchTerm, [],
            $this->activeAssetCollection)->getQuery());
        return new NeosAssetProxyQueryResult($query->execute(), $this->assetSource);
    }

    public function findByTag(Tag $tag): AssetProxyQueryResultInterface
    {
        $query = $this->filterQuery($this->assetRepository->findByTag($tag, $this->activeAssetCollection)->getQuery());
        return new NeosAssetProxyQueryResult($query->execute(), $this->assetSource);
    }

    public function findUntagged(): AssetProxyQueryResultInterface
    {
        $query = $this->filterQuery($this->assetRepository->findUntagged($this->activeAssetCollection)->getQuery());
        return new NeosAssetProxyQueryResult($query->execute(), $this->assetSource);
    }

    public function filterUnassigned(): void
    {
        $this->filterAssetsInCollections = true;
    }

    public function filterUntagged(): void
    {
        $this->filterAssetsWithTags = true;
    }

    public function countAll(): int
    {
        return $this->filterQuery($this->assetRepository->createQuery(), true)->count();
    }

    public function countUntagged(): int
    {
        $query = $this->filterQuery($this->assetRepository->createQuery(), true);
        try {
            $query->matching($query->isEmpty('tags'));
        } catch (InvalidQueryException $e) {
        }
        return $query->count();
    }

    public function countByTag(Tag $tag): int
    {
        return $this->filterQuery($this->assetRepository->findByTag($tag, $this->activeAssetCollection)->getQuery(),
            true)->count();
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
        if (!method_exists($query, 'getQueryBuilder')) {
            return $query;
        }
        $query->getQueryBuilder()->andWhere('e NOT INSTANCE OF ' . ImageVariant::class);
        return $query;
    }

    private function filterOutAssetsWithTags(QueryInterface $query): QueryInterface
    {
        $constraints = $query->getConstraint();
        try {
            $query->matching(
                $query->logicalAnd([
                    $constraints,
                    $query->isEmpty('tags'),
                ])
            );
        } catch (InvalidQueryException $e) {
        }
        return $query;
    }

    private function filterOutAssetsWithoutActiveTag(QueryInterface $query): QueryInterface
    {
        $constraints = $query->getConstraint();
        try {
            $query->matching(
                $query->logicalAnd([
                    $constraints,
                    $query->contains('tags', $this->activeTag)
                ])
            );
        } catch (InvalidQueryException $e) {
        }
        return $query;
    }

    private function filterOutAssetsFromOtherAssetCollections(QueryInterface $query): QueryInterface
    {
        $constraints = $query->getConstraint();
        try {
            $query->matching(
                $query->logicalAnd([
                    $constraints,
                    $query->contains('assetCollections', $this->activeAssetCollection),
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
                    $query->isEmpty('assetCollections'),
                ])
            );
        } catch (InvalidQueryException $e) {
        }
        return $query;
    }

    private function filterOutAssetsWithOtherMediaTypes(QueryInterface $query): QueryInterface
    {
        $constraints = $query->getConstraint();
        return $query->matching(
            $query->logicalAnd([
                $constraints,
                $query->equals('resource.mediaType', $this->mediaTypeFilter),
            ])
        );
    }
}
