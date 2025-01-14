<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\StringBased;

#[Flow\Proxy(false)]
#[StringBased]
final class TagId implements \JsonSerializable
{
    public const UNTAGGED = 'UNTAGGED';

    private function __construct(public readonly string $value)
    {
    }

    public function jsonSerialize(): string
    {
        return $this->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }

    public function isUntagged(): bool
    {
        return $this->value === self::UNTAGGED;
    }
}
