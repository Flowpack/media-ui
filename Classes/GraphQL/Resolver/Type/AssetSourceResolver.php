<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver\Type;

use Neos\Media\Domain\Model\AssetSource\AssetSourceInterface;
use Neos\Media\Domain\Model\AssetSource\SupportsCollectionsInterface;
use Neos\Media\Domain\Model\AssetSource\SupportsTaggingInterface;
use t3n\GraphQL\ResolverInterface;

class AssetSourceResolver implements ResolverInterface
{
    /**
     * @param AssetSourceInterface $assetSource
     * @return bool
     */
    public function supportsTagging(AssetSourceInterface $assetSource)
    {
        return $assetSource->getAssetProxyRepository() instanceof SupportsTaggingInterface;
    }

    /**
     * @param AssetSourceInterface $assetSource
     * @return bool
     */
    public function supportsCollections(AssetSourceInterface $assetSource)
    {
        return $assetSource->getAssetProxyRepository() instanceof SupportsCollectionsInterface;
    }
}
