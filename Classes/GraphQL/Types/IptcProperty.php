<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;

#[Description('IPTC metadata of an asset that implements the SupportsIptcMetadataInterface (see https://www.iptc.org/))')]
#[Flow\Proxy(false)]
final class IptcProperty
{
    private function __construct(
        public readonly IptcPropertyName $propertyName,
        public readonly string $value,
    ) {
    }
}
