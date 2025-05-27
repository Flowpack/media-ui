<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\ListBased;

#[Description('All asset collections')]
#[Flow\Proxy(false)]
#[ListBased(itemClassName: AssetCollection::class)]
final class AssetCollections implements \IteratorAggregate
{
    private function __construct(public readonly array $collections)
    {
    }

    /**
     * @param AssetCollection[] $assetCollections
     */
    public static function fromArray(array $assetCollections): self
    {
        return new self($assetCollections);
    }

    /**
     * @return \Traversable<AssetCollection>
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
