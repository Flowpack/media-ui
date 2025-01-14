<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;

#[Flow\Proxy(false)]
#[Description('A metadata key and value')]
final class UsageDetailsMetadata
{
    private function __construct(
        public readonly MetadataName $name,
        public readonly ?string $value,
    ) {
    }
}
