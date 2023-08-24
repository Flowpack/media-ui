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
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryResultInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyRepositoryInterface;
use Neos\Media\Domain\Model\AssetSource\AssetTypeFilter;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetNotFoundException;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetProxy;
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
 *
 * @Flow\Scope("singleton")
 */
class NeosAssetProxyRepository implements AssetProxyRepositoryInterface, SupportsSortingInterface,
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
     * @param array $orderings The property names to order by default
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

    private function getFilteredQuery(): NativeNeosAssetProxyQuery
    {
        $query = new NativeNeosAssetProxyQuery($this, $this->assetSource, $this->assetRepository->getEntityClassName());

        if ($this->activeAssetCollection) {
            $query->withAssetCollection($this->activeAssetCollection);
        } elseif ($this->filterAssetsInCollections) {
            $query->withoutAssetCollections();
        }

        if ($this->activeTag) {
            $query->withTag($this->activeTag);
        } else {
            if ($this->filterAssetsWithTags) {
                $query->withoutTags();
            }
        }

        if ($this->mediaTypeFilter) {
            $query->withMediaType($this->mediaTypeFilter);
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

    /**
     * @param string[] $identifiers
     * @return NeosAssetProxy[]
     * @throws InvalidQueryException
     */
    public function getAssetProxies(array $identifiers): array
    {
        $query = $this->assetRepository->createQuery();
        $assets = $query->matching($query->in('Persistence_Object_Identifier', $identifiers))->execute();
        return array_map(function (AssetInterface $asset) {
            return new NeosAssetProxy($asset, $this->assetSource);
        }, $assets->toArray());
    }

    public function getQuery(): NativeNeosAssetProxyQuery
    {
        return $this->getFilteredQuery();
    }

    public function findAll(): AssetProxyQueryResultInterface
    {
        return $this->getFilteredQuery()->execute();
    }

    public function findBySearchTerm(string $searchTerm): AssetProxyQueryResultInterface
    {
        return $this->getFilteredQuery()->withSearchTerm($searchTerm)->execute();
    }

    public function findByTag(Tag $tag): AssetProxyQueryResultInterface
    {
        return $this->getFilteredQuery()->withTag($tag)->execute();
    }

    public function findUntagged(): AssetProxyQueryResultInterface
    {
        return $this->getFilteredQuery()->withoutTags()->execute();
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
        return $this->getFilteredQuery()->count();
    }

    public function countUntagged(): int
    {
        return $this->getFilteredQuery()->withoutTags()->count();
    }

    public function countByTag(Tag $tag): int
    {
        return $this->getFilteredQuery()->withTag($tag)->count();
    }
}
