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

use Neos\Flow\Security\Authorization\Privilege\Entity\Doctrine\PropertyConditionGenerator;
use Neos\Media\Security\Authorization\Privilege\Doctrine\AssetCollectionConditionGenerator;

/**
 * An extended SQL condition generator, supporting special SQL constraints for hierarchical asset collections
 */
class HierarchicalAssetCollectionConditionGenerator extends AssetCollectionConditionGenerator
{
    public function isInPath(string $path): PropertyConditionGenerator
    {
        return (new PropertyConditionGenerator('path'))->like($path . '%');
    }
}
