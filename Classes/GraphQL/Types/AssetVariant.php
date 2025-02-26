<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetVariantInterface;
use Neos\Media\Domain\Model\ImageVariant;
use Wwwision\Types\Attributes\Description;

use function Wwwision\Types\instantiate;

#[Description('An asset variant')]
#[Flow\Proxy(false)]
final class AssetVariant
{
    private function __construct(
        public readonly AssetId $id,
        # TODO: Introduce Type for pixel dimensions
        #[Description('The width in pixels (only for Images and Videos)')]
        public readonly int $width = 0,
        #[Description('The height in pixels (only for Images and Videos)')]
        public readonly int $height = 0,
        public readonly ?VariantName $variantName = null,
        public readonly ?VariantPresetIdentifier $presetIdentifier = null,
    ) {
    }

    public static function fromAssetVariant(AssetVariantInterface $assetVariant): self
    {
        $width = 0;
        $height = 0;
        /** @noinspection PhpConditionAlreadyCheckedInspection */
        if ($assetVariant instanceof ImageVariant) {
            $width = $assetVariant->getWidth();
            $height = $assetVariant->getHeight();
        }
        return instantiate(self::class, [
            'id' => $assetVariant->getIdentifier(),
            'width' => $width,
            'height' => $height,
        ]);
    }
}
