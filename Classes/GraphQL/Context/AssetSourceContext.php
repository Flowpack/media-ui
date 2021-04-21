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

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Model\AssetSource\AssetSourceInterface;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Domain\Service\AssetSourceService;
use Neos\Media\Exception\AssetSourceServiceException;
use t3n\GraphQL\Context as BaseContext;

class AssetSourceContext extends BaseContext
{

    /**
     * @Flow\Inject
     * @var AssetRepository
     */
    protected $assetRepository;

    /**
     * @Flow\Inject
     * @var AssetSourceService
     */
    protected $assetSourceService;

    /**
     * @Flow\Inject
     * @var PersistenceManagerInterface
     */
    protected $persistenceManager;

    /**
     * @var array<AssetSourceInterface>
     */
    protected $assetSources;

    /**
     * @var array<AssetInterface>
     */
    protected $localAssetData = [];

    /**
     * @return void
     */
    public function initializeObject(): void
    {
        $this->assetSources = $this->assetSourceService->getAssetSources();
    }

    /**
     * @return array<AssetSourceInterface>
     */
    public function getAssetSources(): array
    {
        return $this->assetSources;
    }

    /**
     * @param string $id
     * @param string $assetSourceIdentifier
     * @return AssetProxyInterface|null
     */
    public function getAssetProxy(string $id, string $assetSourceIdentifier): ?AssetProxyInterface
    {
        $activeAssetSource = $this->getAssetSource($assetSourceIdentifier);
        if (!$activeAssetSource) {
            return null;
        }

        $assetProxy = $activeAssetSource->getAssetProxyRepository()->getAssetProxy($id);
        if (!$assetProxy) {
            return null;
        }
        return $assetProxy;
    }

    /**
     * @param AssetProxyInterface $assetProxy
     * @return AssetInterface|null
     */
    public function getAssetForProxy(AssetProxyInterface $assetProxy): ?AssetInterface
    {
        $assetIdentifier = $assetProxy->getLocalAssetIdentifier();

        if (!$assetIdentifier) {
            return null;
        }

        if (array_key_exists($assetIdentifier, $this->localAssetData)) {
            return $this->localAssetData[$assetIdentifier];
        }

        /** @var Asset $asset */
        $asset = $this->assetRepository->findByIdentifier($assetIdentifier);

        return $this->localAssetData[$assetIdentifier] = $asset;
    }

    /**
     * @param string $assetSourceName
     * @return AssetSourceInterface|null
     */
    public function getAssetSource(string $assetSourceName): ?AssetSourceInterface
    {
        return $this->assetSources[$assetSourceName] ?? null;
    }

    /**
     * @param string $assetSourceIdentifier
     * @param string $assetIdentifier
     * @return AssetProxyInterface|null
     */
    public function importAsset(string $assetSourceIdentifier, string $assetIdentifier): ?AssetProxyInterface
    {
        try {
            $this->assetSourceService->importAsset($assetSourceIdentifier, $assetIdentifier);
            $this->persistenceManager->persistAll();
            return $this->getAssetProxy($assetIdentifier, $assetSourceIdentifier);
        } catch (AssetSourceServiceException | \Exception $e) {
        }
        return null;
    }
}
