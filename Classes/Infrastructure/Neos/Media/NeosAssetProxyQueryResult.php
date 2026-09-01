<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Infrastructure\Neos\Media;

use ArrayIterator;
use Doctrine\ORM\Query;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxyQueryResultInterface;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetProxy;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetSource;

/**
 * An AssetProxyQueryResultInterface implementation that is backed by a Doctrine
 * ORM Query instead of Flow's persistence QueryInterface.
 */
final class NeosAssetProxyQueryResult implements AssetProxyQueryResultInterface
{
    private ?array $assetProxies = null;
    private ?ArrayIterator $iterator = null;

    public function __construct(
        private readonly Query $query,
        private readonly Query $countQuery,
        private readonly NeosAssetSource $assetSource,
    ) {
    }

    /**
     * @return AssetProxyInterface[]
     */
    private function assetProxies(): array
    {
        if ($this->assetProxies === null) {
            $assetProxies = [];
            foreach ($this->query->getResult() as $asset) {
                if ($asset instanceof AssetInterface) {
                    $assetProxies[] = new NeosAssetProxy($asset, $this->assetSource);
                }
            }
            $this->assetProxies = $assetProxies;
        }

        return $this->assetProxies;
    }

    private function iterator(): ArrayIterator
    {
        if ($this->iterator === null) {
            $this->iterator = new ArrayIterator($this->assetProxies());
        }

        return $this->iterator;
    }

    public function getQuery(): AssetProxyQueryInterface
    {
        return new NeosAssetQuery($this->query, $this->countQuery, $this->assetSource);
    }

    public function getFirst(): ?AssetProxyInterface
    {
        return $this->assetProxies()[0] ?? null;
    }

    public function toArray(): array
    {
        return $this->assetProxies();
    }

    public function current(): ?AssetProxyInterface
    {
        return $this->iterator()->current();
    }

    #[\ReturnTypeWillChange]
    public function next(): void
    {
        $this->iterator()->next();
    }

    #[\ReturnTypeWillChange]
    public function key()
    {
        return $this->iterator()->key();
    }

    #[\ReturnTypeWillChange]
    public function valid(): bool
    {
        return $this->iterator()->valid();
    }

    #[\ReturnTypeWillChange]
    public function rewind(): void
    {
        $this->iterator()->rewind();
    }

    #[\ReturnTypeWillChange]
    public function offsetExists($offset): bool
    {
        return $this->iterator()->offsetExists($offset);
    }

    #[\ReturnTypeWillChange]
    public function offsetGet($offset)
    {
        return $this->assetProxies()[$offset] ?? null;
    }

    #[\ReturnTypeWillChange]
    public function offsetSet($offset, $value): void
    {
        throw new \RuntimeException('Unsupported operation: ' . __METHOD__, 1510060444);
    }

    #[\ReturnTypeWillChange]
    public function offsetUnset($offset): void
    {
        throw new \RuntimeException('Unsupported operation: ' . __METHOD__, 1510060467);
    }

    public function count(): int
    {
        return count($this->assetProxies());
    }
}
