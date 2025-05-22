<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\ListBased;

#[Flow\Proxy(false)]
#[ListBased(itemClassName: TagId::class)]
final class TagIds implements \IteratorAggregate, \JsonSerializable
{
    /**
     * @param TagId[] $values
     */
    private function __construct(public readonly array $values)
    {
    }

    /**
     * @param TagId[] $tagIds
     */
    public static function fromArray(array $tagIds): self
    {
        return new self($tagIds);
    }

    /**
     * @return \Traversable<TagId>
     */
    public function getIterator(): \Traversable
    {
        yield from $this->values;
    }

    public static function empty(): self
    {
        return new self([]);
    }

    public function jsonSerialize(): array
    {
        return $this->values;
    }
}
