<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver\Type;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

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
        if (method_exists($assetSource, 'getDescription')) {
            return $assetSource->getDescription();
        }
        return '';
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
