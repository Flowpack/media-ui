<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\ListBased;

#[Description('Asset usages grouped by service')]
#[Flow\Proxy(false)]
#[ListBased(itemClassName: UsageDetailsGroup::class)]
final class UsageDetailsGroups implements \IteratorAggregate
{
    /**
     * @param UsageDetailsGroup[] $groups
     */
    private function __construct(
        public readonly array $groups,
    ) {
    }

    /**
     * @param UsageDetailsGroup[] $groups
     */
    public static function fromArray(array $groups): self
    {
        return new self($groups);
    }

    /**
     * @return \Traversable<UsageDetailsGroup>
     */
    public function getIterator(): \Traversable
    {
        yield from $this->groups;
    }

    public static function empty(): self
    {
        return new self([]);
    }
}
