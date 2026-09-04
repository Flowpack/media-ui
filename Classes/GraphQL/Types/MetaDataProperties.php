<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\ListBased;

/**
 * @implements \IteratorAggregate<MetaDataProperty>
 */
#[Flow\Proxy(false)]
#[ListBased(itemClassName: MetaDataProperty::class)]
final class MetaDataProperties implements \IteratorAggregate
{
    /**
     * @param list<MetaDataProperty> $properties
     */
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
