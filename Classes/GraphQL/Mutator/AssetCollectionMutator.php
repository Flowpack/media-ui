<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Mutator;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Doctrine\Common\Collections\ArrayCollection;
use Flowpack\Media\Ui\Domain\Model\Dto\MutationResult;
use Flowpack\Media\Ui\Domain\Model\HierarchicalAssetCollectionInterface;
use Flowpack\Media\Ui\Exception;
use Flowpack\Media\Ui\GraphQL\Types;
use Flowpack\Media\Ui\Service\AssetCollectionService;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\Exception\IllegalObjectTypeException;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Repository\AssetCollectionRepository;
use Neos\Media\Domain\Repository\TagRepository;
use Neos\Neos\Domain\Repository\SiteRepository;

use function Wwwision\Types\instantiate;

#[Flow\Scope("singleton")]
class AssetCollectionMutator
{
    public function __construct(
        private readonly AssetCollectionRepository $assetCollectionRepository,
        private readonly AssetCollectionService $assetCollectionService,
        private readonly PersistenceManagerInterface $persistenceManager,
        private readonly TagRepository $tagRepository,
        private readonly SiteRepository $siteRepository,
    ) {
    }

    /**
     * @throws IllegalObjectTypeException
     */
    public function createAssetCollection(
        string $title,
        Types\AssetCollectionId $parent = null
    ): Types\AssetCollection {
        $newAssetCollection = new AssetCollection($title);
        if ($parent) {
            $parentCollection = $this->assetCollectionRepository->findByIdentifier($parent->value);
            /** @var HierarchicalAssetCollectionInterface $newAssetCollection */
            /** @phpstan-ignore varTag.nativeType */
            $newAssetCollection->setParent($parentCollection);
        }

        // FIXME: Multiple asset collections with the same title can exist, but do we want that?
        $this->assetCollectionRepository->add($newAssetCollection);
        return instantiate(Types\AssetCollection::class, [
            'id' => $this->persistenceManager->getIdentifierByObject($newAssetCollection),
            'title' => $newAssetCollection->getTitle(),
            'path' => $newAssetCollection->getPath(),
        ]);
    }

    /**
     * @throws Exception|IllegalObjectTypeException
     */
    public function deleteAssetCollection(Types\AssetCollectionId $id): MutationResult
    {
        $assetCollection = $this->assetCollectionRepository->findByIdentifier($id->value);
        if (!$assetCollection) {
            throw new Exception('Asset collection not found', 1591972269);
        }

        if ($this->assetCollectionService->getAssetCollectionAssetCount($id) > 0) {
            throw new Exception('Asset collection is not empty', 1730102095);
        }

        /** @noinspection PhpUndefinedMethodInspection */
        if ($this->siteRepository->findOneByAssetCollection($assetCollection)) {
            throw new Exception('Asset collection is referenced as default collection of a site', 1730101671);
        }

        $this->assetCollectionRepository->remove($assetCollection);
        return new MutationResult(true);
    }

    /**
     * @throws Exception|IllegalObjectTypeException
     */
    public function updateAssetCollection(
        Types\AssetCollectionId $id,
        string $title = null,
        Types\TagIds $tagIds = null
    ): MutationResult {
        /** @var AssetCollection&HierarchicalAssetCollectionInterface $assetCollection */
        $assetCollection = $this->assetCollectionRepository->findByIdentifier($id->value);
        if (!$assetCollection) {
            throw new Exception('Asset collection not found', 1590659045);
        }

        if (is_string($title) && trim($title)) {
            $assetCollection->setTitle(trim($title));
        }

        if ($tagIds !== null) {
            $tags = new ArrayCollection();
            foreach ($tagIds as $tagId) {
                $tag = $this->tagRepository->findByIdentifier($tagId->value);
                if (!$tag) {
                    throw new Exception('Cannot tag asset collection with tag that does not exist', 1594621319);
                }
                $tags->add($tag);
            }
            $assetCollection->setTags($tags);
        }

        $this->assetCollectionRepository->update($assetCollection);
        $this->assetCollectionService->updatePathForNestedAssetCollections($assetCollection);
        return new MutationResult(true);
    }

    /**
     * @throws Exception|IllegalObjectTypeException
     */
    public function setAssetCollectionParent(
        Types\AssetCollectionId $id,
        Types\AssetCollectionId $parent = null
    ): MutationResult {
        /** @var AssetCollection $assetCollection */
        $assetCollection = $this->assetCollectionRepository->findByIdentifier($id->value);

        if (!$assetCollection) {
            throw new Exception('Asset collection not found', 1681999816);
        }

        /** @var HierarchicalAssetCollectionInterface $assetCollection */
        if ($parent) {
            /** @var AssetCollection $parentCollection */
            $parentCollection = $this->assetCollectionRepository->findByIdentifier($parent->value);
            if (!$parentCollection) {
                throw new Exception('Parent asset collection not found', 1681999836);
            }
            $assetCollection->setParent($parentCollection);
        } else {
            $assetCollection->setParent(null);
        }
        $this->assetCollectionRepository->update($assetCollection);
        $this->assetCollectionService->updatePathForNestedAssetCollections($assetCollection);
        return new MutationResult(true);
    }
}
