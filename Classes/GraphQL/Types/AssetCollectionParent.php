<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;

#[Description('The id and title of an asset collection parent')]
#[Flow\Proxy(false)]
final class AssetCollectionParent
{
    private function __construct(
        public readonly AssetCollectionId $id,
        public readonly AssetCollectionTitle $title,
    ) {
    }
}
