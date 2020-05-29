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
     * @param AssetProxyInterface $assetProxy
     * @return string|null
     */
    public function id(AssetProxyInterface $assetProxy): ?string
    {
        return $assetProxy->getIdentifier();
    }

    /**
     * Returns the title of the associated local asset data or the label of the proxy as fallback
     *
     * @param AssetProxyInterface $assetProxy
     * @return string|null
     */
    public function label(AssetProxyInterface $assetProxy): ?string
    {
        $localAssetData = $this->localAssetData($assetProxy);
        if ($localAssetData && $localAssetData->getTitle()) {
            return $localAssetData->getTitle();
        }
        return $assetProxy->getLabel();
    }

    /**
     * Returns the caption of the associated local asset data
     *
     * @param AssetProxyInterface $assetProxy
     * @return string|null
     */
    public function caption(AssetProxyInterface $assetProxy): ?string
    {
        $localAssetData = $this->localAssetData($assetProxy);
        if ($localAssetData) {
            return $localAssetData->getCaption();
        }
        return null;
    }

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
     * @param AssetProxyInterface $assetProxy
     * @return bool
     */
    public function imported(AssetProxyInterface $assetProxy): bool
    {
        return (bool)$assetProxy->getLocalAssetIdentifier();
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
        $icon = $this->fileTypeIconService::getIcon($assetProxy->getFilename());
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
            return array_map(static function ($key) use ($properties) {
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
