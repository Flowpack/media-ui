<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Wwwision\Types\Attributes\ListBased;

#[Flow\Proxy(false)]
#[ListBased(itemClassName: Asset::class)]
final class Assets implements \IteratorAggregate
{
    private function __construct(public readonly array $assets)
    {
    }

    public static function empty(): self
    {
        return new self([]);
    }

    /**
     * @param iterable<int, AssetInterface> $assets
     */
    public static function fromAssets(iterable $assets): self
    {
        $assetList = [];
        foreach ($assets as $asset) {
            $assetList[] = Asset::fromAssetProxy($asset->getAssetProxy());
        }
        return new self($assetList);
    }

    /**
     * @param iterable<int, AssetProxyInterface> $assetProxies
     */
    public static function fromAssetProxies(iterable $assetProxies): self
    {
        $assetList = [];
        foreach ($assetProxies as $assetProxy) {
            $assetList[] = Asset::fromAssetProxy($assetProxy);
        }
        return new self($assetList);
    }

    /**
     * @param Asset[] $assets
     */
    public static function fromArray(array $assets): self
    {
        return new self($assets);
    }

    /**
     * @return \Traversable<Asset>
     */
    public function getIterator(): \Traversable
    {
        yield from $this->assets;
    }
}
