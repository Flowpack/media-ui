<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\ListBased;

#[Description('All asset sources')]
#[Flow\Proxy(false)]
#[ListBased(itemClassName: AssetSource::class)]
final class AssetSources implements \IteratorAggregate
{
    private function __construct(public readonly array $collections)
    {
    }

    /**
     * @param AssetSource[] $assetSources
     */
    public static function fromArray(array $assetSources): self
    {
        return new self($assetSources);
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
