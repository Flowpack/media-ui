<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Wwwision\Types\Attributes\Description;
use Wwwision\Types\Attributes\StringBased;

#[Description('Unique identifier (UUID) of an imported Asset')]
#[Flow\Proxy(false)]
#[StringBased]
final class LocalAssetId implements \JsonSerializable
{
    private function __construct(public readonly string $value)
    {
    }

    public function jsonSerialize(): string
    {
        return $this->value;
    }

    public static function fromAssetProxy(AssetProxyInterface $assetProxy): ?self
    {
        return $assetProxy->getLocalAssetIdentifier() ? new self($assetProxy->getLocalAssetIdentifier()) : null;
    }

    public static function fromAsset(AssetInterface $asset): self
    {
        if (!method_exists($asset, 'getIdentifier')) {
            throw new \Exception('Asset implementations must implement getIdentifier(), whatever the interfaces says', 1776326064);
        }
        return $asset->getIdentifier();
    }
}
