<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetVariantInterface;
use Neos\Media\Domain\Model\ImageVariant;
use Wwwision\Types\Attributes\Description;

use function Wwwision\Types\instantiate;

#[Flow\Proxy(false)]
final class CropInformation
{
    private function __construct(
        # TODO: Introduce Type for pixel dimensions
        #[Description('The width in pixels (only for Images and Videos)')]
        public readonly int $width = 0,
        #[Description('The height in pixels (only for Images and Videos)')]
        public readonly int $height = 0,
        public readonly int $x = 0,
        public readonly int $y = 0,
    ) {
    }

    public static function empty(): self
    {
        return instantiate(self::class, [
            'width' => 0,
            'height' => 0,
            'x' => 0,
            'y' => 0,
        ]);
    }
}
