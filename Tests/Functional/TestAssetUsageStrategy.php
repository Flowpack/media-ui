<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Tests\Functional;

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
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\Dto\UsageReference;
use Neos\Media\Domain\Strategy\AbstractAssetUsageStrategy;

/**
 * A test asset usage strategy that allows marking assets as used for testing purposes.
 *
 * This strategy extends AbstractAssetUsageStrategy and provides a simple way to control
 * asset usage state in functional tests. It maintains an internal registry of assets
 * that are marked as "in use" and will be automatically discovered by the AssetService.
 *
 * Usage example:
 * ```php
 * // In your test setUp():
 * $this->testAssetUsageStrategy = $this->objectManager->get(TestAssetUsageStrategy::class);
 * $this->assetRepository = $this->objectManager->get(AssetRepository::class);
 *
 * // In your test:
 * $assetEntity = $this->assetRepository->findByIdentifier($assetId);
 * $this->testAssetUsageStrategy->markAssetAsUsed($assetEntity);
 *
 * // Now AssetService->isInUse($assetEntity) will return true
 * // and deletion attempts will fail
 * ```
 *
 * @Flow\Scope("singleton")
 */
class TestAssetUsageStrategy extends AbstractAssetUsageStrategy
{
    /**
     * @var array<string, AssetInterface>
     */
    protected $usedAssets = [];

    /**
     * Mark an asset as being used
     */
    public function markAssetAsUsed(AssetInterface $asset): void
    {
        if (!$asset instanceof Asset) {
            throw new \InvalidArgumentException('Only Asset entities can be marked as used in TestAssetUsageStrategy');
        }
        $this->usedAssets[$asset->getIdentifier()] = $asset;
    }

    /**
     * Mark an asset as not being used
     */
    public function markAssetAsUnused(AssetInterface $asset): void
    {
        if (!$asset instanceof Asset) {
            throw new \InvalidArgumentException('Only Asset entities can be marked as used in TestAssetUsageStrategy');
        }
        unset($this->usedAssets[$asset->getIdentifier()]);
    }

    /**
     * Reset all usage markings
     */
    public function reset(): void
    {
        $this->usedAssets = [];
    }

    /**
     * Returns an array of usage reference objects.
     *
     * @return array<UsageReference>
     */
    public function getUsageReferences(AssetInterface $asset): array
    {
        if (!$asset instanceof Asset) {
            throw new \InvalidArgumentException('Only Asset entities can be marked as used in TestAssetUsageStrategy');
        }
        if (isset($this->usedAssets[$asset->getIdentifier()])) {
            return [new UsageReference($asset)];
        }
        return [];
    }
}
