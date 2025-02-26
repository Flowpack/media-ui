<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\StringBased;

/**
 * TODO: Turn into an enum with values:
 * ASSET_CREATED
 * ASSET_REPLACED
 * ASSET_UPDATED
 * ASSET_REMOVED TODO: Use ASSET_DELETED instead
 */
#[Flow\Proxy(false)]
#[Description('The type of a change to an asset')]
#[StringBased]
final class AssetChangeType implements \JsonSerializable
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
