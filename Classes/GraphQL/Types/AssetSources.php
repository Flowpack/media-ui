<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\ListBased;

/**
 * @implements \IteratorAggregate<string,AssetSource>
 */
#[Description('All asset sources')]
#[Flow\Proxy(false)]
#[ListBased(itemClassName: AssetSource::class)]
final class AssetSources implements \IteratorAggregate
{
    /**
     * @param array<string, AssetSource> $items indexed by asset source id
     */
    private function __construct(public readonly array $items)
    {
    }

    /**
     * @param array<string, AssetSource> $assetSources
     */
    public static function fromArray(array $assetSources): self
    {
        return new self($assetSources);
    }

    /**
     * @return \Traversable<string, AssetSource>
     */
    public function getIterator(): \Traversable
    {
        yield from $this->items;
    }

    public static function empty(): self
    {
        return new self([]);
    }
}
