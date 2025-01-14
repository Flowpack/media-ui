<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;

#[Flow\Proxy(false)]
#[Description('The result of the changed assets query containing the hash of the last change and all changed asset ids')]
final class ChangedAssetsResult
{
    private function __construct(
        public readonly \DateTime $lastModified,
        public readonly AssetChanges $changes,
    ) {
    }
}
