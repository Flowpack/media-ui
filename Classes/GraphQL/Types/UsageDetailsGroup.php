<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Wwwision\Types\Attributes\Description;
use Neos\Flow\Annotations as Flow;

#[Description('Asset usages for a specific service')]
#[Flow\Proxy(false)]
final class UsageDetailsGroup
{
    private function __construct(
        public readonly ServiceId $serviceId,
        public readonly string $label,
        public readonly UsageDetailsMetadataSchemaList $metadataSchema,
        public readonly UsageDetailsList $usages
    )
    {
    }
}
