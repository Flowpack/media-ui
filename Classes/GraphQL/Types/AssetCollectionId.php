<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\StringBased;

#[Description('Unique identifier of an Asset collection (e.g. "neos")')]
#[Flow\Proxy(false)]
#[StringBased]
final class AssetCollectionId implements \JsonSerializable, \Stringable
{
    public const UNASSIGNED = 'UNASSIGNED';

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

    public function isUnassigned(): bool
    {
        return $this->value === self::UNASSIGNED;
    }

    public function equals(?AssetCollectionId $id): bool
    {
        return $this->value === $id?->value;
    }
}
