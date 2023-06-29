<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Infrastructure\Neos\Media;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Flowpack\Media\Ui\Domain\Model\AssetProxyIteratorAggregate;
use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;

/**
 * @Flow\Proxy(false)
 * @internal
 */
final class AssetProxyListIterator implements AssetProxyIteratorAggregate
{
    /**
     * @var AssetProxyInterface[]
     */
    private array $assetProxies;

    private int $offset = 0;
    private ?int $limit = null;

    private function __construct(AssetProxyInterface ...$assetProxies)
    {
        $this->assetProxies = $assetProxies;
    }

    public static function of(AssetProxyInterface ...$assetProxies): self
    {
        return new self(...$assetProxies);
    }

    public function setOffset(int $offset): void
    {
        $this->offset = $offset;
    }

    public function setLimit(?int $limit): void
    {
        $this->limit = $limit;
    }

    public function count(): int
    {
        return count($this->assetProxies);
    }

    /**
     * @return \Traversable<AssetProxyInterface>
     */
    public function getIterator(): \Traversable
    {
        yield from array_slice($this->assetProxies, $this->offset, $this->limit);
    }
}
