<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\StringBased;

#[Description('Name of an IPTC metadata property (e.g. "Creator", see https://www.iptc.org/)')]
#[Flow\Proxy(false)]
#[StringBased]
final class IptcPropertyName implements \JsonSerializable
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
