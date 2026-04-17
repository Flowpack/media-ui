<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Model\AssetSource\AssetSourceInterface;
use Wwwision\Types\Attributes\Description;

/**
 * @property File $file -> see resolver
 */
#[Description('An asset (Image, Document, Video or Audio)')]
#[Flow\Proxy(false)]
final class Asset
{
    private function __construct(
        public readonly AssetId $id,
        public readonly Filename $filename,
        public readonly AssetSource $assetSource,
        # TODO: Introduce Type for pixel dimensions
        #[Description('The width in pixels (only for Images and Videos)')]
        public readonly ?int $width = null,
        #[Description('The height in pixels (only for Images and Videos)')]
        public readonly ?int $height = null,
        public readonly ?LocalAssetId $localId = null,
    ) {
    }

    public static function fromAssetProxy(AssetProxyInterface $assetProxy): self
    {
        return new self(
            AssetId::fromString($assetProxy->getIdentifier()),
            Filename::fromString($assetProxy->getFilename()),
            AssetSource::fromAssetSource($assetProxy->getAssetSource()),
            $assetProxy->getWidthInPixels(),
            $assetProxy->getHeightInPixels(),
            LocalAssetId::fromAssetProxy($assetProxy),
        );
    }

    public static function fromAsset(AssetInterface $asset, AssetSourceInterface $assetSource): self
    {
        if (!method_exists($asset, 'getIdentifier')) {
            throw new \Exception('Asset implementations must implement getIdentifier(), whatever the interfaces says', 1776326064);
        }
        return new self(
            AssetId::fromString($asset->getIdentifier()),
            Filename::fromString($asset->getResource()->getFilename()),
            AssetSource::fromAssetSource($assetSource),
            method_exists($asset, 'getWidth') ? $asset->getWidth() : null,
            method_exists($asset, 'getHeight') ? $asset->getHeight() : null,
            LocalAssetId::fromAsset($asset),
        );
    }
}
