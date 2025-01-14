<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;

/**
 * TODO: Include assetSourceId, currently changes only happen in the Neos asset source, but might happen somewhere else too
 */
#[Flow\Proxy(false)]
#[Description('One single change to an asset')]
final class AssetChange
{
    private function __construct(
        public readonly \DateTime $lastModified,
        public readonly AssetId $assetId,
        public readonly AssetChangeType $type,
    ) {
    }
}
