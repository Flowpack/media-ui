<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;

#[Description('The file-representation of an asset including its type and (if available) the URL')]
#[Flow\Proxy(false)]
final class File
{
    private function __construct(
        public readonly FileExtension $extension,
        public readonly MediaType $mediaType,
        public readonly Image $typeIcon,
        public readonly FileSize $size,
        public readonly Url $url,
    ) {
    }
}
