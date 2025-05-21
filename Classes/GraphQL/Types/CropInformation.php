<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;

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
        return new self();
    }
}
