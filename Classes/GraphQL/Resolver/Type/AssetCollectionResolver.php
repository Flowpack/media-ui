<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver\Type;

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
use Flowpack\Media\Ui\GraphQL\Types;
use Flowpack\Media\Ui\Service\AssetCollectionService;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Repository\AssetCollectionRepository;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Neos\Domain\Model\Site;
use Neos\Neos\Domain\Repository\SiteRepository;

use function Wwwision\Types\instantiate;

#[Flow\Scope('singleton')]
class AssetCollectionResolver
{
    /**
     * @var PersistenceManagerInterface
     */
    #[Flow\Inject]
    protected $persistenceManager;

    #[Flow\Inject]
    protected AssetRepository $assetRepository;

    #[Flow\Inject]
    protected AssetCollectionService $assetCollectionService;

    #[Flow\Inject]
    protected SiteRepository $siteRepository;

    #[Flow\Inject]
    protected AssetCollectionRepository $assetCollectionRepository;

    protected array|null $siteDefaultAssetCollections = null;

    public function assetCount(Types\AssetCollection $assetCollection): int
    {
        return $this->assetCollectionService->getAssetCollectionAssetCount($assetCollection->id);
    }

    /**
     * Returns true if the asset collection is empty and is not assigned as default collection for a site
     */
    public function canDelete(Types\AssetCollection $assetCollection): bool
    {
        if ($this->siteDefaultAssetCollections === null) {
            $this->siteDefaultAssetCollections = [];
            /** @var Site $site */
            foreach ($this->siteRepository->findAll() as $site) {
                $siteAssetCollection = $site->getAssetCollection();
                if (!$siteAssetCollection) {
                    continue;
                }
                $siteAssetCollectionId = $this->persistenceManager->getIdentifierByObject($siteAssetCollection);
                $this->siteDefaultAssetCollections[$siteAssetCollectionId] = true;
            }
        }

        return !array_key_exists(
                $assetCollection->id->value,
                $this->siteDefaultAssetCollections
            ) && $this->assetCount($assetCollection) === 0;
    }

    public function tags(Types\AssetCollection $assetCollection): Types\Tags
    {
        /** @var AssetCollection $originalAssetCollection */
        $originalAssetCollection = $this->assetCollectionRepository->findByIdentifier($assetCollection->id->value);

        return $originalAssetCollection ? Types\Tags::fromArray(array_map(
            fn(Tag $tag) => instantiate(Types\Tag::class, [
                'id' => $this->persistenceManager->getIdentifierByObject($tag),
                'label' => $tag->getLabel(),
            ]),
            $originalAssetCollection->getTags()->toArray()
        )) : Types\Tags::empty();
    }

    public function parent(Types\AssetCollection $assetCollection): ?Types\AssetCollectionParent
    {
        /** @var HierarchicalAssetCollectionInterface $originalAssetCollection */
        $originalAssetCollection = $this->assetCollectionRepository->findByIdentifier($assetCollection->id->value);
        if (!$originalAssetCollection) {
            return null;
        }
        $parent = $originalAssetCollection->getParent();
        return $parent ? instantiate(Types\AssetCollectionParent::class, [
            'id' => $this->persistenceManager->getIdentifierByObject($parent),
            'title' => $parent->getTitle(),
        ]) : null;
    }

    public function assets(Types\AssetCollection $assetCollection): Types\Assets
    {
        /** @var AssetCollection $originalAssetCollection */
        $originalAssetCollection = $this->assetCollectionRepository->findByIdentifier($assetCollection->id->value);
        return $originalAssetCollection ?
            Types\Assets::fromArray(
                $this->assetRepository->findByAssetCollection($originalAssetCollection)->toArray()
            ) : Types\Assets::empty();
    }
}
