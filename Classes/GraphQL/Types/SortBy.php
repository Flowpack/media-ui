<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\StringBased;

/**
 * TODO: Turn into an enum with values:
 * name
 * lastModified
 * size
 */
#[Flow\Proxy(false)]
#[Description('Fields to sort assets by')]
#[StringBased]
final class SortBy implements \JsonSerializable
{
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
}
