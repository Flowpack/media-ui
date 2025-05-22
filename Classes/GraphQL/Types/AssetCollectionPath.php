<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\StringBased;

#[Description('Absolute path of an Asset collection (e.g. "/photos/trees")')]
#[Flow\Proxy(false)]
#[StringBased]
final class AssetCollectionPath implements \JsonSerializable, \Stringable
{
    private function __construct(public readonly string $value)
    {
    }

    public static function fromString(string $path): self
    {
        return new self($path);
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
