<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Security\Authorization\Privilege;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Flowpack\Media\Ui\Security\Authorization\Privilege\Doctrine\AssetConditionGenerator;

/**
 * Privilege for restricting reading of Assets in hierarchical asset collections
 */
class ReadAssetPrivilege extends \Neos\Media\Security\Authorization\Privilege\ReadAssetPrivilege
{
    protected function getConditionGenerator(): AssetConditionGenerator
    {
        return new AssetConditionGenerator();
    }
}
