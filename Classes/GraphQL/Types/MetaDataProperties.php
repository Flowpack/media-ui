<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\ListBased;

#[Flow\Proxy(false)]
#[ListBased(itemClassName: MetaDataProperty::class)]
final class MetaDataProperties implements \IteratorAggregate
{
    private function __construct(public readonly array $properties)
    {
    }

    /**
     * @param MetaDataProperty[] $metaDataProperties
     */
    public static function fromArray(array $metaDataProperties): self
    {
        return new self($metaDataProperties);
    }

    /**
     * @return \Traversable<MetaDataProperty>
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
