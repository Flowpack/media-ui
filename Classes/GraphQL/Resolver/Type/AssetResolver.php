<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver\Type;

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
    public function label(Asset $asset): string
    {
        return $asset->getLabel();
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

    /**
     * @param Asset $asset
     * @return string
     */
    public function copyrightNotice(Asset $asset): string
    {
        return $asset->getCopyrightNotice();
    }

    /**
     * @param Asset $asset
     * @return string
     */
    public function filename(Asset $asset): string
    {
        return $asset->getResource()->getFilename();
    }

    /**
     * @param Asset $asset
     * @return array
     */
    public function tags(Asset $asset): array
    {
        return $asset->getTags()->toArray();
    }
}
