<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;

#[Flow\Proxy(false)]
#[Description('A tag to which assets can be assigned')]
final readonly class Tag
{
    private function __construct(
        public TagId $id,
        public AssetSourceId $assetSourceId,
        public TagLabel $label,
    ) {
    }

    public static function create(TagId $id, AssetSourceId $assetSourceId, TagLabel $label): self
    {
        return new self($id, $assetSourceId, $label);
    }
}
