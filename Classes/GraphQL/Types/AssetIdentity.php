<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Neos\Flow\Annotations as Flow;
use Wwwision\Types\Attributes\Description;

#[Description('Unique identity of an Asset in an asset-source')]
#[Flow\Proxy(false)]
final readonly class AssetIdentity implements \JsonSerializable
{
    private function __construct(
        public AssetId $assetId,
        public AssetSourceId $assetSourceId,
    ) {
    }

    public static function create(AssetId $assetId, AssetSourceId $assetSourceId): self
    {
        return new self($assetId, $assetSourceId);
    }

    public function jsonSerialize(): array
    {
        return [
            'id' => $this->assetId,
            'assetSourceId' => $this->assetSourceId,
        ];
    }
}
