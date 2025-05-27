<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\ListBased;

#[Flow\Proxy(false)]
#[ListBased(itemClassName: IptcProperty::class)]
final class IptcProperties implements \IteratorAggregate
{
    private function __construct(public readonly array $properties)
    {
    }

    /**
     * @param IptcProperty[] $iptcProperties
     */
    public static function fromArray(array $iptcProperties): self
    {
        return new self($iptcProperties);
    }

    /**
     * @return \Traversable<IptcProperty>
     */
    public function getIterator(): \Traversable
    {
        yield from $this->properties;
    }

    public static function empty(): self
    {
        return new self([]);
    }
}
