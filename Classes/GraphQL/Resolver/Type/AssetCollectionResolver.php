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

use Flowpack\Media\Ui\Service\AssetCollectionService;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Neos\Domain\Model\Site;
use Neos\Neos\Domain\Repository\SiteRepository;
use t3n\GraphQL\ResolverInterface;

#[Flow\Scope('singleton')]
class AssetCollectionResolver implements ResolverInterface
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

    protected array|null $siteDefaultAssetCollections = null;

    public function id(AssetCollection $assetCollection): string
    {
        return $this->persistenceManager->getIdentifierByObject($assetCollection);
    }

    public function assetCount(AssetCollection $assetCollection): int
    {
        return $this->assetCollectionService->getAssetCollectionAssetCount($this->id($assetCollection));
    }

    /**
     * Returns true if the asset collection is empty and is not assigned as default collection for a site
     */
    public function canDelete(AssetCollection $assetCollection): bool
    {
        if ($this->siteDefaultAssetCollections === null) {
            $this->siteDefaultAssetCollections = [];
            /** @var Site $site */
            foreach ($this->siteRepository->findAll() as $site) {
                $siteAssetCollection = $site->getAssetCollection();
                if (!$siteAssetCollection) {
                    continue;
                }
                $this->siteDefaultAssetCollections[$this->id($site->getAssetCollection())] = true;
            }
        }

        return !array_key_exists($this->id($assetCollection), $this->siteDefaultAssetCollections)
            && $this->assetCount($assetCollection) === 0;
    }
}
