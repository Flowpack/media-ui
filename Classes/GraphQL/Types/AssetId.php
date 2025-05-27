<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\StringBased;

#[Description('Unique identifier (UUID) of an Asset')]
#[Flow\Proxy(false)]
#[StringBased]
final class AssetId implements \JsonSerializable
{
    private function __construct(public readonly string $value)
    {
    }

    public static function fromString(string $identifier): self
    {
        return new self($identifier);
    }

    public function jsonSerialize(): string
    {
        return $this->value;
    }
}
