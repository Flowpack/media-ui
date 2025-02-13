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

use Flowpack\Media\Ui\GraphQL\Types;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Model\AssetSource\AssetSourceInterface;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Domain\Service\AssetSourceService;
use Neos\Media\Exception\AssetSourceServiceException;

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
}
