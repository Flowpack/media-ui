<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\ListBased;

use function Wwwision\Types\instantiate;

#[Description('A collection of assets. One asset can belong to multiple collections')]
#[Flow\Proxy(false)]
#[ListBased(itemClassName: UsageDetailsMetadata::class)]
final class UsageDetailsMetadataList implements \IteratorAggregate
{
    private function __construct(
        public readonly array $items,
    ) {
    }

    /**
     * @return \Traversable<UsageDetailsMetadata>
     */
    public function getIterator(): \Traversable
    {
        yield from $this->items;
    }

    public static function empty(): self
    {
        return instantiate(self::class, []);
    }
}
