<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\StringBased;

#[Description('Name of a metadata property defined in the Neos.MetaData package (e.g. "copyright", "altText", "caption")')]
#[Flow\Proxy(false)]
#[StringBased]
final class MetaDataPropertyName implements \JsonSerializable
{
    private function __construct(public readonly string $value)
    {
    }

    public static function fromString(string $key): self
    {
        return new self($key);
    }

    public function jsonSerialize(): string
    {
        return $this->value;
    }
}
