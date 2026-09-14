<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\ListBased;

/**
 * @implements \IteratorAggregate<AssetCollectionId>
 */
#[Flow\Proxy(false)]
#[ListBased(itemClassName: AssetCollectionId::class)]
final class AssetCollectionIds implements \IteratorAggregate, \JsonSerializable
{
    /**
     * @param array<AssetCollectionId> $values
     */
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

    /**
     * @return array<AssetCollectionId>
     */
    public function jsonSerialize(): array
    {
        return $this->values;
    }
}
