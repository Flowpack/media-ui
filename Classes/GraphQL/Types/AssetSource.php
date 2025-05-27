<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Types;

use Wwwision\Types\Attributes\Description;
use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetSource\AssetSourceInterface;
use Neos\Media\Domain\Model\AssetSource\SupportsCollectionsInterface;
use Neos\Media\Domain\Model\AssetSource\SupportsTaggingInterface;

use function Wwwision\Types\instantiate;

#[Description('Asset sources allow to integrate assets from external DAM systems')]
#[Flow\Proxy(false)]
final class AssetSource
{
    private function __construct(
        public readonly AssetSourceId $id,
        public readonly string $label,
        public readonly string $description,
        public readonly bool $readOnly,
        public readonly bool $supportsTagging,
        public readonly bool $supportsCollections,
        public readonly Url|null $iconUri = null,
    ) {
    }

    public static function fromAssetSource(AssetSourceInterface $assetSource): self
    {
        return instantiate(self::class, [
            'id' => $assetSource->getIdentifier(),
            'label' => $assetSource->getLabel(),
            'description' => $assetSource->getDescription(),
            'iconUri' => $assetSource->getIconUri() ? Url::fromString($assetSource->getIconUri()) : null,
            'readOnly' => $assetSource->isReadonly(),
            'supportsTagging' => $assetSource->getAssetProxyRepository() instanceof SupportsTaggingInterface,
            'supportsCollections' => $assetSource->getAssetProxyRepository() instanceof SupportsCollectionsInterface,
        ]);
    }
}
