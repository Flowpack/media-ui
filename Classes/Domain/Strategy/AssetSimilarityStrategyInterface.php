<?php
declare(strict_types=1);
namespace Flowpack\Media\Ui\Domain\Strategy;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Neos\Media\Domain\Model\AssetInterface;

/**
 * Interface for asset similarity strategies
 */
interface AssetSimilarityStrategyInterface
{
    /**
     * Returns true if the asset has at least one similar other asset
     */
    public function hasSimilarAssets(AssetInterface $asset): bool;

    /**
     * Returns the total count of similar assets
     */
    public function getSimilarAssetCount(AssetInterface $asset): int;

    /**
     * Returns an array of similar assets.
     *
     * @return AssetInterface[]
     */
    public function getSimilarAssets(AssetInterface $asset): array;
}
