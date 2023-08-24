<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Domain\Model\AssetSource;

use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryResultInterface;
use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetProxy;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetSource;

/**
 * @Flow\Proxy(false)
 */
class NativeNeosAssetProxyQueryResult implements AssetProxyQueryResultInterface
{

    protected NativeNeosAssetProxyQuery $assetProxyQuery;
    protected NeosAssetSource $assetSource;
    protected \ArrayObject $assets;
    private \ArrayIterator $assetIterator;

    /**
     * @param NeosAssetProxy[] $assets
     */
    public function __construct(
        NativeNeosAssetProxyQuery $assetProxyQuery,
        array $assets,
        NeosAssetSource $assetSource
    ) {
        $this->assetProxyQuery = $assetProxyQuery;
        $this->assets = new \ArrayObject($assets);
        $this->assetIterator = $this->assets->getIterator();
        $this->assetSource = $assetSource;
    }

    public function rewind(): void
    {
        $this->assetIterator->rewind();
    }

    public function getQuery(): AssetProxyQueryInterface
    {
        return $this->assetProxyQuery;
    }

    public function getFirst(): ?AssetProxyInterface
    {
        return $this->offsetGet(0);
    }

    public function toArray(): array
    {
        return $this->assetIterator->getArrayCopy();
    }

    public function current(): ?AssetProxyInterface
    {
        return $this->assetIterator->current();
    }

    public function next(): void
    {
        $this->assetIterator->next();
    }

    public function key()
    {
        return $this->assetIterator->key();
    }

    public function valid(): bool
    {
        return $this->assetIterator->valid();
    }

    public function offsetExists($offset): bool
    {
        return $this->assetIterator->offsetExists($offset);
    }

    public function offsetGet($offset): ?AssetProxyInterface
    {
        return $this->assetIterator->offsetGet($offset);
    }

    public function offsetSet($offset, $value): void
    {
        $this->assetIterator->offsetSet($offset, $value);
    }

    public function offsetUnset($offset): void
    {
        $this->assetIterator->offsetUnset($offset);
    }

    public function count(): int
    {
        return count($this->assets);
    }
}
