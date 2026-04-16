<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Context;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Flowpack\Media\Ui\Domain\Model\HierarchicalAssetCollectionInterface;
use Flowpack\Media\Ui\Exception as MediaUiException;
use Flowpack\Media\Ui\GraphQL\Types;
use Flowpack\Media\Ui\GraphQL\Types\TagLabel;
use Flowpack\Media\Ui\Service\UsageDetailsService;
use Neos\Flow\Persistence\Exception\IllegalObjectTypeException;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Model\AssetSource\AssetSourceInterface;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Repository\AssetCollectionRepository;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Domain\Repository\TagRepository;
use Neos\Media\Domain\Service\AssetSourceService;
use Neos\Media\Exception\AssetSourceServiceException;

/**
 * This class is the translation layer between the Media.Ui API and the capabilities of the asset sources
 */
class AssetSourceContext
{
    /**
     * @var AssetSourceInterface[]
     */
    protected array $assetSources = [];

    /**
     * @var AssetInterface[]
     */
    protected array $localAssetData = [];

    /**
     */
    public function __construct(
        protected readonly PersistenceManagerInterface $persistenceManager,
        protected readonly AssetSourceService $assetSourceService,
        protected readonly AssetRepository $assetRepository,
        protected readonly AssetCollectionRepository $assetCollectionRepository,
        protected readonly TagRepository $tagRepository,
        protected readonly UsageDetailsService $usageDetailsService,
    ) {
        $this->assetSources = $this->assetSourceService->getAssetSources();
    }

    /**
     * @return AssetSourceInterface[]
     */
    public function getAssetSources(): array
    {
        return $this->assetSources;
    }

    public function getAssetProxy(Types\AssetId $id, Types\AssetSourceId $assetSourceIdentifier): ?AssetProxyInterface
    {
        $activeAssetSource = $this->getAssetSource($assetSourceIdentifier);
        if (!$activeAssetSource) {
            return null;
        }

        try {
            return $activeAssetSource->getAssetProxyRepository()->getAssetProxy($id->value);
        } catch (\Exception) {
            // Some assetProxy repositories like the NeosAssetProxyRepository throw exceptions if an asset was not found
            return null;
        }
    }

    public function getAsset(Types\AssetId $id, Types\AssetSourceId $assetSourceIdentifier): ?AssetInterface
    {
        $assetProxy = $this->getAssetProxy($id, $assetSourceIdentifier);
        return $assetProxy ? $this->getAssetForProxy($assetProxy) : null;
    }

    public function getAssetForProxy(AssetProxyInterface $assetProxy): ?AssetInterface
    {
        $localAssetId = Types\LocalAssetId::fromAssetProxy($assetProxy);
        return $localAssetId ? $this->getAssetByLocalIdentifier($localAssetId) : null;
    }

    public function getAssetByLocalIdentifier(Types\LocalAssetId $localAssetIdentifier): ?AssetInterface
    {
        if (array_key_exists($localAssetIdentifier->value, $this->localAssetData)) {
            return $this->localAssetData[$localAssetIdentifier->value];
        }
        /** @var Asset $asset */
        $asset = $this->assetRepository->findByIdentifier($localAssetIdentifier->value);
        return $this->localAssetData[$localAssetIdentifier->value] = $asset;
    }

    public function getAssetSource(Types\AssetSourceId $assetSourceId): ?AssetSourceInterface
    {
        return $this->assetSources[$assetSourceId->value] ?? null;
    }

    public function importAsset(
        Types\AssetSourceId $assetSourceIdentifier,
        Types\AssetId $assetIdentifier
    ): ?AssetProxyInterface {
        try {
            $this->assetSourceService->importAsset($assetSourceIdentifier->value, $assetIdentifier->value);
            $this->persistenceManager->persistAll();
            return $this->getAssetProxy($assetIdentifier, $assetSourceIdentifier);
        } catch (AssetSourceServiceException|\Exception $e) {
        }
        return null;
    }

    public function getAssetCollections(?Types\AssetSourceId $assetSourceId): Types\AssetCollections
    {
        if ($assetSourceId->value !== 'neos') {
            // We currently only know about collections in the neos asset source
            return Types\AssetCollections::empty();
        }

        return Types\AssetCollections::fromArray(
            array_map(
                fn(HierarchicalAssetCollectionInterface $assetCollection) => Types\AssetCollection::create(
                    Types\AssetCollectionId::fromString(
                        $this->persistenceManager->getIdentifierByObject($assetCollection)
                    ),
                    $assetSourceId,
                    Types\AssetCollectionTitle::fromString($assetCollection->getTitle()),
                    Types\AssetCollectionPath::fromString($assetCollection->getPath()),
                ),
                $this->assetCollectionRepository->findAll()->toArray()
            )
        );
    }

    public function getAssetCollection(
        Types\AssetCollectionId $id,
        Types\AssetSourceId $assetSourceId
    ): ?Types\AssetCollection {
        if ($assetSourceId->value !== 'neos') {
            // We currently only know about collections in the neos asset source
            return null;
        }
        /** @var HierarchicalAssetCollectionInterface $assetCollection */
        $assetCollection = $this->assetCollectionRepository->findByIdentifier($id->value);
        return $assetCollection ? Types\AssetCollection::create(
            $id,
            $assetSourceId,
            Types\AssetCollectionTitle::fromString($assetCollection->getTitle()),
            Types\AssetCollectionPath::fromString($assetCollection->getPath()),
        ) : null;
    }

    public function getTags(?Types\AssetSourceId $assetSourceId): Types\Tags
    {
        if ($assetSourceId->value !== 'neos') {
            // We currently only know about tags in the neos asset source
            return Types\Tags::empty();
        }

        return Types\Tags::fromArray(
            array_map(
                fn(Tag $tag) => Types\Tag::create(
                    Types\TagId::fromString($this->persistenceManager->getIdentifierByObject($tag)),
                    $assetSourceId,
                    TagLabel::fromString($tag->getLabel()),
                ),
                $this->tagRepository->findAll()->toArray()
            )
        );
    }

    public function getTag(Types\TagId $id, Types\AssetSourceId $assetSourceId): ?Types\Tag
    {
        if ($assetSourceId->value !== 'neos') {
            // We currently only support creating collections in the neos asset source
            return null;
        }
        /** @var Tag $tag */
        $tag = $this->tagRepository->findByIdentifier($id->value);
        return $tag ? Types\Tag::create($id, $assetSourceId, TagLabel::fromString($tag->getLabel())) : null;
    }

    /**
     * @throws IllegalObjectTypeException
     */
    public function createAssetCollection(
        Types\AssetCollectionTitle $title,
        Types\AssetSourceId $assetSourceId,
        ?Types\AssetCollectionId $parent
    ): ?Types\AssetCollection {
        if ($assetSourceId->value !== 'neos') {
            // We currently only support creating collections in the neos asset source
            return null;
        }

        /** @var HierarchicalAssetCollectionInterface&AssetCollection $newAssetCollection */
        $newAssetCollection = new AssetCollection($title->value);
        if ($parent) {
            $parentCollection = $this->assetCollectionRepository->findByIdentifier($parent->value);
            $newAssetCollection->setParent($parentCollection);
        }

        // FIXME: Multiple asset collections with the same title can exist, but do we want that?
        $this->assetCollectionRepository->add($newAssetCollection);
        return Types\AssetCollection::create(
            Types\AssetCollectionId::fromString($this->persistenceManager->getIdentifierByObject($newAssetCollection)),
            $assetSourceId,
            Types\AssetCollectionTitle::fromString($newAssetCollection->getTitle()),
            Types\AssetCollectionPath::fromString($newAssetCollection->getPath()),
        );
    }

    /**
     * @throws MediaUiException
     */
    public function getUnusedAssets(Types\AssetSourceId $assetSourceId, int $limit, int $offset): Types\Assets
    {
        if ($assetSourceId->value !== 'neos') {
            // We currently only support creating collections in the neos asset source
            return Types\Assets::empty();
        }

        return $this->usageDetailsService->getUnusedAssets($limit, $offset, Types\AssetSourceId::default());
    }
}
