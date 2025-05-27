<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\ListBased;

#[Flow\Proxy(false)]
#[ListBased(itemClassName: AssetVariant::class)]
final class AssetVariants implements \IteratorAggregate
{
    private function __construct(public readonly array $assetVariants)
    {
    }

    public static function fromAssetVariants(iterable $assetVariants): self
    {
        $assetVariantList = [];
        foreach ($assetVariants as $assetVariant) {
            $assetVariantList[] = AssetVariant::fromAssetVariant($assetVariant);
        }
        return new self($assetVariantList);
    }

    public static function empty(): self
    {
        return new self([]);
    }

    /**
     * @return \Traversable<AssetVariant>
     */
    public function getIterator(): \Traversable
    {
        yield from $this->assetVariants;
    }
}
