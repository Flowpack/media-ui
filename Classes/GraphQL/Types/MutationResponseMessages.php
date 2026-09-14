<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\ListBased;

/**
 * @implements \IteratorAggregate<MutationResponseMessage>
 */
#[Flow\Proxy(false)]
#[ListBased(itemClassName: MutationResponseMessage::class)]
final class MutationResponseMessages implements \IteratorAggregate, \JsonSerializable
{
    /**
     * @param array<MutationResponseMessage> $values
     */
    private function __construct(public readonly array $values)
    {
    }

    /**
     * @param array<MutationResponseMessage> $array
     */
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

    public function isEmpty(): bool
    {
        return count($this->values) === 0;
    }

    public static function empty(): self
    {
        return new self([]);
    }

    /**
     * @return MutationResponseMessage[]
     */
    public function jsonSerialize(): array
    {
        return $this->values;
    }
}
