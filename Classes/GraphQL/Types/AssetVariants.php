<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetVariantInterface;
use Wwwision\Types\Attributes\ListBased;

/**
 * @implements \IteratorAggregate<AssetVariant>
 */
#[Flow\Proxy(false)]
#[ListBased(itemClassName: AssetVariant::class)]
final class AssetVariants implements \IteratorAggregate
{
    /**
     * @param array<AssetVariant> $assetVariants
     */
    private function __construct(public readonly array $assetVariants)
    {
    }

    /**
     * @param array<AssetVariant> $items
     */
    public static function fromArray(array $items): self
    {
        return new self($items);
    }

    /**
     * @param iterable<AssetVariantInterface> $assetVariants
     */
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
