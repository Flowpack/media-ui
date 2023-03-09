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

use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;

/**
 * @extends \IteratorAggregate<AssetProxyInterface>
 */
interface AssetProxyIteratorAggregate extends \Countable, \IteratorAggregate
{
    public function setOffset(int $offset): void;

    public function setLimit(?int $limit): void;
}
