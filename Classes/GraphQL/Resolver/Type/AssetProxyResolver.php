<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver\Type;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\SupportsIptcMetadataInterface;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Domain\Service\FileTypeIconService;
use t3n\GraphQL\ResolverInterface;

/**
 * @Flow\Scope("singleton")
 */
class AssetProxyResolver implements ResolverInterface
{
    /**
     * @Flow\Inject
     * @var AssetRepository
     */
    protected $assetRepository;

    /**
     * @Flow\Inject
     * @var FileTypeIconService
     */
    protected $fileTypeIconService;

    /**
     * @Flow\Inject
     * @var ResourceManager
     */
    protected $resourceManager;

    /**
     * Returns the locally stored assetdata for the given assetproxy if it exists. Remote assets have no local asset data.
     *
     * @param AssetProxyInterface $assetProxy
     * @return Asset|object|null
     */
    public function localAssetData(AssetProxyInterface $assetProxy)
    {
        $localAssetIdentifier = $assetProxy->getLocalAssetIdentifier();
        if ($localAssetIdentifier) {
            return $this->assetRepository->findByIdentifier($localAssetIdentifier);
        }
        return null;
    }

    /**
     *
     * Returns a matching icon uri for the given assetproxy
     *
     * @param AssetProxyInterface $assetProxy
     * @return array
     */
    public function fileTypeIcon(AssetProxyInterface $assetProxy): array
    {
        $icon = $this->fileTypeIconService->getIcon($assetProxy->getFilename());
        $icon['src'] = $this->resourceManager->getPublicPackageResourceUriByPath($icon['src']);
        return $icon;
    }

    /**
     * Returns the iptc properties for assetproxies that implement the interface
     *
     * @param AssetProxyInterface $assetProxy
     * @return array
     */
    public function iptcMetadata(AssetProxyInterface $assetProxy): array
    {
        if ($assetProxy instanceof SupportsIptcMetadataInterface) {
            $properties = $assetProxy->getIptcProperties();
            return array_map(function ($key) use ($properties) {
                return ['key' => $key, 'value' => $properties[$key]];
            }, array_keys($properties));
        }
        return [];
    }

    /**
     * @param AssetProxyInterface $assetProxy
     * @return string
     */
    public function lastModified(AssetProxyInterface $assetProxy): string
    {
        // TODO: Remove this method when a DateTime scalar for graphql was introduced
        return $assetProxy->getLastModified()->format(DATE_W3C);
    }
}
