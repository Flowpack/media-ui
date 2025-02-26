<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;

#[Description('Representation of an image that can be rendered to the browser')]
#[Flow\Proxy(false)]
final class Image
{
    private function __construct(
        public readonly int $width,
        public readonly int $height,
        public readonly Url $url,
        public readonly string $alt,
    ) {
    }
}
