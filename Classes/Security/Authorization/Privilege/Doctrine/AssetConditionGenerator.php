<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Security\Authorization\Privilege\Doctrine;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

/**
 * A SQL condition generator, supporting special SQL constraints for assets in hierarchical asset collections
 */
class AssetConditionGenerator extends \Neos\Media\Security\Authorization\Privilege\Doctrine\AssetConditionGenerator
{
    public function isInCollectionPath(string $collectionTitle): AssetAssetCollectionConditionGenerator
    {
        return new AssetAssetCollectionConditionGenerator($collectionTitle);
    }
}
