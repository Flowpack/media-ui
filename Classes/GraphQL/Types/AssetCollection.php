<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Wwwision\Types\Attributes\Description;
use Neos\Flow\Annotations as Flow;

#[Description('A collection of assets. One asset can belong to multiple collections')]
#[Flow\Proxy(false)]
final class AssetCollection
{
    private function __construct(
        public readonly AssetCollectionId $id,
        public readonly AssetCollectionTitle $title,
        public readonly ?AssetCollectionPath $path = null,
    ) {
    }

    public function equals(?AssetCollection $assetCollection): bool
    {
        return $assetCollection !== null && $this->id->equals($assetCollection->id);
    }
}
