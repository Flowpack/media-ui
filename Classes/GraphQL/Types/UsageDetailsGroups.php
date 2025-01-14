<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\ListBased;

use function Wwwision\Types\instantiate;

#[Description('A collection of assets. One asset can belong to multiple collections')]
#[Flow\Proxy(false)]
#[ListBased(itemClassName: UsageDetailsGroup::class)]
final class UsageDetailsGroups implements \IteratorAggregate
{
    private function __construct(
        public readonly array $groups,
    ) {
    }

    public function getIterator(): \Traversable
    {
        yield from $this->groups;
    }

    public static function empty(): self
    {
        return instantiate(self::class, []);
    }
}
