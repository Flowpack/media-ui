<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;

#[Flow\Proxy(false)]
#[Description('A tag to which assets can be assigned')]
final class Tag
{
    private function __construct(
        public readonly TagId $id,
        public readonly TagLabel $label,
    ) {
    }
}
