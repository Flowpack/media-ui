<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver\Type;

use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\AssetSource\AssetSourceInterface;
use Neos\Media\Domain\Model\AssetSource\SupportsCollectionsInterface;
use Neos\Media\Domain\Model\AssetSource\SupportsTaggingInterface;
use t3n\GraphQL\ResolverInterface;

/**
 * @Flow\Scope("singleton")
 */
class AssetSourceResolver implements ResolverInterface
{
    /**
     * @param AssetSourceInterface $assetSource
     * @return string
     */
    public function id(AssetSourceInterface $assetSource): string
    {
        return $assetSource->getIdentifier();
    }

    /**
     * @param AssetSourceInterface $assetSource
     * @return bool
     */
    public function supportsTagging(AssetSourceInterface $assetSource): bool
    {
        return $assetSource->getAssetProxyRepository() instanceof SupportsTaggingInterface;
    }

    /**
     * @param AssetSourceInterface $assetSource
     * @return bool
     */
    public function supportsCollections(AssetSourceInterface $assetSource): bool
    {
        return $assetSource->getAssetProxyRepository() instanceof SupportsCollectionsInterface;
    }

    /**
     * @param AssetSourceInterface $assetSource
     * @return string
     */
    public function description(AssetSourceInterface $assetSource): string
    {
        // TODO: Use getter when new describable interface has been implemented
        return 'Description for Asset Source ' . $assetSource->getLabel();
    }

    /**
     * @param AssetSourceInterface $assetSource
     * @return string
     */
    public function iconUri(AssetSourceInterface $assetSource): string
    {
        if (method_exists($assetSource, 'getIconUri')) {
            return $assetSource->getIconUri();
        }
        return '';
    }
}
