<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\ListBased;

#[Description('A list of mutation results')]
#[Flow\Proxy(false)]
#[ListBased(itemClassName: MutationResult::class)]
final class MutationResults implements \IteratorAggregate, \JsonSerializable
{
    /**
     * @param MutationResult[] $values
     */
    private function __construct(public readonly array $values)
    {
    }

    /**
     * @param MutationResult[] $results
     */
    public static function fromArray(array $results): self
    {
        return new self($results);
    }

    /**
     * @return \Traversable<MutationResult>
     */
    public function getIterator(): \Traversable
    {
        yield from $this->values;
    }

    public static function empty(): self
    {
        return new self([]);
    }

    /**
     * @return MutationResult[]
     */
    public function jsonSerialize(): array
    {
        return $this->values;
    }
}
