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
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetSource\AssetSourceInterface;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Domain\Service\AssetSourceService;
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
     * @var array<AssetSourceInterface>
     */
    protected array $assetSources;

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
     * @param string $assetSource
     * @return array
     */
    public function getAssetForProxy(string $id, string $assetSource): array
    {
        $activeAssetSource = $this->getAssetSource($assetSource);
        if (!$activeAssetSource) {
            return [null, null];
        }

        $assetProxy = $activeAssetSource->getAssetProxyRepository()->getAssetProxy($id);
        if (!$assetProxy) {
            return [null, null];
        }

        $assetIdentifier = $assetProxy->getLocalAssetIdentifier();

        /** @var Asset $asset */
        $asset = $this->assetRepository->findByIdentifier($assetIdentifier);

        return [$assetProxy, $asset];
    }

    /**
     * @param string $assetSourceName
     * @return AssetSourceInterface|null
     */
    public function getAssetSource(string $assetSourceName): ?AssetSourceInterface
    {
        return $this->assetSources[$assetSourceName] ?? null;
    }
}
