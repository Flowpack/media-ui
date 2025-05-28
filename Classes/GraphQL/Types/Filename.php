<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\StringBased;

#[Description('Base file name including extension (e.g. "some-file.pdf")')]
#[Flow\Proxy(false)]
#[StringBased]
final class Filename implements \JsonSerializable, \Stringable
{
    private function __construct(public readonly string $value)
    {
    }

    public static function fromString(string $filename): self
    {
        return new self($filename);
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
