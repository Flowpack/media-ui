<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\ListBased;

#[Description('A list of asset identities')]
#[Flow\Proxy(false)]
#[ListBased(itemClassName: AssetIdentity::class)]
final class AssetIdentities implements \IteratorAggregate
{
    /**
     * @param AssetSource[] $collections
     */
    private function __construct(public readonly array $collections)
    {
    }

    /**
     * @param AssetIdentity[] $assetSources
     */
    public static function fromArray(array $assetIdentities): self
    {
        return new self($assetIdentities);
    }

    /**
     * @return \Traversable<AssetSource>
     */
    public function getIterator(): \Traversable
    {
        yield from $this->collections;
    }

    public static function empty(): self
    {
        return new self([]);
    }
}
