<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\StringBased;

#[Description('Unique identifier of an Asset source (e.g. "neos")')]
#[Flow\Proxy(false)]
#[StringBased]
final class AssetSourceId implements \JsonSerializable
{
    private function __construct(public readonly string $value)
    {
    }

    public function jsonSerialize(): string
    {
        return $this->value;
    }

    public static function default(): self
    {
        return new self('neos');
    }
}
