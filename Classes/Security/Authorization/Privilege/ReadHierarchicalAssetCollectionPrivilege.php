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

use Flowpack\Media\Ui\Security\Authorization\Privilege\Doctrine\HierarchicalAssetCollectionConditionGenerator;
use Neos\Media\Security\Authorization\Privilege\ReadAssetCollectionPrivilege;

/**
 * Privilege for restricting reading of HierarchicalAssetCollections
 */
class ReadHierarchicalAssetCollectionPrivilege extends ReadAssetCollectionPrivilege
{
    protected function getConditionGenerator(): HierarchicalAssetCollectionConditionGenerator
    {
        return new HierarchicalAssetCollectionConditionGenerator();
    }
}
