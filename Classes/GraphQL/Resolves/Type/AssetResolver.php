<?php
declare(strict_types=1);

namespace Your\Package\GraphQL\Resolver\Type;

use Neos\Media\Domain\Model\Asset;
use t3n\GraphQL\ResolverInterface;

class AssetResolver implements ResolverInterface
{
    /**
     * @param Asset $asset
     * @return string
     */
    public function title(Asset $asset): string
    {
        return $asset->getTitle();
    }

    /**
     * @param Asset $asset
     * @return string
     */
    public function caption(Asset $asset): string
    {
        return $asset->getCaption();
    }

    /**
     * @param Asset $asset
     * @return string
     */
    public function mediaType(Asset $asset): string
    {
        return $asset->getMediaType();
    }

    /**
     * @param Asset $asset
     * @return string
     */
    public function fileExtension(Asset $asset): string
    {
        return $asset->getFileExtension();
    }
}
