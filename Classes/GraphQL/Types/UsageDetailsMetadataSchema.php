<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;

#[Flow\Proxy(false)]
final class UsageDetailsMetadataSchema
{
    private function __construct(
        public readonly MetadataName $name,
        public readonly string $label,
        public readonly UsageDetailsMetadataType $type,
    ) {
    }
}
