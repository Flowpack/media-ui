<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\StringBased;

#[Description('Neos type of an Asset, can be "All", "Image", "Document", "Video" or "Audio" (see `Neos\Media\Domain\Model\AssetSource\AssetTypeFilter`)')]
#[Flow\Proxy(false)]
#[StringBased]
final class AssetType implements \JsonSerializable
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
