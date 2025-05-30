<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\ListBased;

#[Flow\Proxy(false)]
#[ListBased(itemClassName: MutationResponseMessage::class)]
final class MutationResponseMessages implements \IteratorAggregate, \JsonSerializable
{
    private function __construct(public readonly array $values)
    {
    }

    public static function fromArray(array $array): self
    {
        return new self($array);
    }

    /**
     * @return \Traversable<MutationResponseMessage>
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
