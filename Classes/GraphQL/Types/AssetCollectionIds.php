<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\ListBased;

#[Flow\Proxy(false)]
#[ListBased(itemClassName: AssetCollectionId::class)]
final class AssetCollectionIds implements \IteratorAggregate, \JsonSerializable
{
    private function __construct(public readonly array $values)
    {
    }

    /**
     * @return \Traversable<AssetCollectionId>
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
