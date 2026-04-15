<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;

#[Description('Unique identity of an Asset in an asset-source')]
#[Flow\Proxy(false)]
final class AssetIdentity implements \JsonSerializable
{
    private function __construct(
        public readonly AssetId $id,
        public readonly AssetSourceId $assetSourceId,
    )
    {
    }

    public static function fromArray(array $identity): self {
        return new self ($identity['id'], $identity['assetSourceId']);
    }


    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'assetSourceId' => $this->assetSourceId,
        ];
    }
}
