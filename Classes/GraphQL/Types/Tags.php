<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\ListBased;

#[Flow\Proxy(false)]
#[ListBased(itemClassName: Tag::class)]
final class Tags implements \IteratorAggregate
{
    private function __construct(public readonly array $tags)
    {
    }

    public function getIterator(): \Traversable
    {
        yield from $this->tags;
    }

    public static function empty(): self
    {
        return new self([]);
    }
}
