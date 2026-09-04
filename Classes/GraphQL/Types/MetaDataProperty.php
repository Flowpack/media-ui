<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;

#[Description('Metadata property of an asset as provided by the Neos.MetaData package')]
#[Flow\Proxy(false)]
final class MetaDataProperty
{
    private function __construct(
        public readonly MetaDataPropertyName $propertyName,
        public readonly MetaDataPropertyLabel $propertyLabel,
        public readonly string $value,
        #[Description('The inherited value from a fallback dimension space point, if any')]
        public readonly ?string $inheritedValue = null,
    ) {
    }

    public static function create(
        MetaDataPropertyName $propertyName,
        MetaDataPropertyLabel $propertyLabel,
        string $value,
        ?string $inheritedValue = null
    ): self
    {
        return new self($propertyName, $propertyLabel, $value, $inheritedValue);
    }
}
