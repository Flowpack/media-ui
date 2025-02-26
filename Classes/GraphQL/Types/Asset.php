<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Wwwision\Types\Attributes\Description;

use function Wwwision\Types\instantiate;

/**
 * @property File $file -> see resolver
 */
#[Description('An asset (Image, Document, Video or Audio)')]
#[Flow\Proxy(false)]
final class Asset
{
    private function __construct(
        public readonly AssetId $id,
        public readonly LocalAssetId|null $localId,
        public readonly Filename $filename,
        public readonly AssetSource $assetSource,
        # TODO: Introduce Type for pixel dimensions
        #[Description('The width in pixels (only for Images and Videos)')]
        public readonly int $width,
        #[Description('The height in pixels (only for Images and Videos)')]
        public readonly int $height,
    ) {
    }

    public static function fromAssetProxy(AssetProxyInterface $assetProxy): self
    {
        return instantiate(self::class, [
            'id' => $assetProxy->getIdentifier(),
            'localId' => $assetProxy->getLocalAssetIdentifier(),
            'filename' => $assetProxy->getFilename(),
            'width' => $assetProxy->getWidthInPixels(),
            'height' => $assetProxy->getHeightInPixels(),
            'assetSource' => AssetSource::fromAssetSource($assetProxy->getAssetSource()),
        ]);
    }
}
