<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Domain\Model;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Doctrine\Common\Collections\Collection;
use Neos\Media\Domain\Model\AssetCollection;

interface HierarchicalAssetCollectionInterface
{
    /**
     * @return AssetCollection|null
     */
    public function getParent();

    /**
     * @return void
     */
    public function setParent(?AssetCollection $parent);

    /**
     * @return Collection<AssetCollection>
     */
    public function getChildren();

    /**
     * @return void
     */
    public function addChild(AssetCollection $child);
}
