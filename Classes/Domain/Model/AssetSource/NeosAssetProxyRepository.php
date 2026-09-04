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
use Flowpack\Media\Ui\Infrastructure\Neos\Media\NeosAssetProxyQuery;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\ObjectManagement\ObjectManagerInterface;
use Neos\Media\Domain\Model\Asset;
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

/**
 * This is a copy of the NeosAssetProxyRepository from the Neos.Media package
 * but with some additional methods to support the Flowpack.Media.Ui package.
 *
 * All query related logic lives in {@see NeosAssetProxyQuery}; this repository
 * only keeps the public asset source API and delegates to it.
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

    private ?NeosAssetProxyQuery $query = null;

    public function __construct(NeosAssetSource $assetSource)
    {
        $this->assetSource = $assetSource;
    }

    public function initializeObject(): void
    {
    }

    private function query(): NeosAssetProxyQuery
    {
        if ($this->query === null) {
            $this->query = new NeosAssetProxyQuery($this->objectManager, $this->entityManager, $this->assetSource);
        }

        return $this->query;
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
        $this->query()->setOrderings($orderings);
    }

    public function filterByType(?AssetTypeFilter $assetType = null): void
    {
        $this->query()->setAssetType((string)$assetType);
    }

    public function filterByMediaType(string $mediaType): void
    {
        $this->query()->setMediaType($mediaType);
    }

    /**
     * NOTE: This needs to be refactored to use an asset collection identifier instead of Media's domain model before
     *       it can become a public API for other asset sources.
     */
    public function filterByCollection(?AssetCollection $assetCollection = null): void
    {
        $this->query()->setAssetCollection($assetCollection);
    }

    public function filterByTag(Tag $tag): void
    {
        $this->query()->setTag($tag);
    }

    /**
     * @throws NeosAssetNotFoundException
     */
    public function getAssetProxy(string $identifier): AssetProxyInterface
    {
        $asset = $this->entityManager->getRepository($this->query()->getEntityClassName())->find($identifier);
        if (!$asset instanceof AssetInterface) {
            throw new NeosAssetNotFoundException('The specified asset was not found.', 1509632861);
        }

        return new NeosAssetProxy($asset, $this->assetSource);
    }

    public function findAll(): AssetProxyQueryResultInterface
    {
        return $this->query()->findAll();
    }

    public function findBySearchTerm(string $searchTerm): AssetProxyQueryResultInterface
    {
        return $this->query()->findBySearchTerm($searchTerm);
    }

    public function findByTag(Tag $tag): AssetProxyQueryResultInterface
    {
        return $this->query()->findByTag($tag);
    }

    public function findUntagged(): AssetProxyQueryResultInterface
    {
        return $this->query()->findUntagged();
    }

    public function filterUnassigned(): void
    {
        $this->query()->setFilterAssetsInCollections(true);
    }

    public function filterUntagged(): void
    {
        $this->query()->setFilterAssetsWithTags(true);
    }

    public function countAll(): int
    {
        return $this->query()->countAll();
    }

    public function countUntagged(): int
    {
        return $this->query()->countUntagged();
    }

    public function countByTag(Tag $tag): int
    {
        return $this->query()->countByTag($tag);
    }
}
