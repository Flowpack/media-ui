<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Wwwision\Types\Attributes\ListBased;

use function Wwwision\Types\instantiate;

#[Flow\Proxy(false)]
#[ListBased(itemClassName: Asset::class)]
final class Assets implements \IteratorAggregate
{
    private function __construct(public readonly array $assets)
    {
    }

    public static function empty(): self
    {
        return instantiate(self::class, []);
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
        return instantiate(self::class, $assetList);
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
        return instantiate(self::class, $assetList);
    }

    public function getIterator(): \Traversable
    {
        yield from $this->assets;
    }
}
