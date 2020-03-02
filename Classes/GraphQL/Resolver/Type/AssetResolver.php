<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver\Type;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\Routing\UriBuilder;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Service\ThumbnailService;
use Psr\Log\LoggerInterface;
use t3n\GraphQL\ResolverInterface;

/**
 * @Flow\Scope("singleton")
 */
class AssetResolver implements ResolverInterface
{
    /**
     * @Flow\Inject
     * @var ThumbnailService
     */
    protected $thumbnailService;

    /**
     * @Flow\Inject
     * @var LoggerInterface
     */
    protected $systemLogger;

    /**
     * @Flow\Inject
     * @var UriBuilder
     */
    protected $uriBuilder;

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

    /**
     * @param Asset $asset
     * @return string|null
     */
    public function thumbnail(Asset $asset): ?string
    {
        try {
            if ($asset->getAssetProxy()) {
                // TODO: This is currently broken for local assets. See https://github.com/neos/neos-development-collection/pull/2924
                return (string)$asset->getAssetProxy()->getThumbnailUri();
            } else {
                $this->systemLogger->warning('Could not create thumbnail as asset has not AssetProxy', [$asset->getLabel()]);
            }
        } catch (\Exception $e) {
            // TODO: Write to log or otherwise handle the when the asset proxy throws an error during thumbnail creation
            $this->systemLogger->error('Exception during thumbnail creation for asset', [$asset->getLabel()]);
        }
        return null;
    }
}
