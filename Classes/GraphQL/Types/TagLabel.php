<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\StringBased;

#[Description('The label of a Tag (e.g. "important")')]
#[Flow\Proxy(false)]
#[StringBased]
final class TagLabel implements \JsonSerializable, \Stringable
{
    private function __construct(public readonly string $value)
    {
    }

    public static function fromString(string $string): self
    {
        return new self($string);
    }

    public function jsonSerialize(): string
    {
        return $this->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
