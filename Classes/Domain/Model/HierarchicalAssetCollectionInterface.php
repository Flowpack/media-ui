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

/**
 * This interface is required for the HierachicalAssetCollectionAspect to add the
 * hierarchical collection functionality to the AssetCollection domain model.
 *
 * Attention: Keep the docblocks or the HierachicalAssetCollectionAspect will throw errors!
 */
interface HierarchicalAssetCollectionInterface
{
    /**
     * @return string
     */
    public function getTitle();

    /**
     * @return Collection
     */
    public function getTags();

    /**
     * @return AssetCollection|null
     */
    public function getParent();

    /**
     * @return void
     */
    public function setParent(?AssetCollection $parent);

    /**
     * @return void
     */
    public function unsetParent();

    /**
     * @return bool
     */
    public function hasParent();
}
