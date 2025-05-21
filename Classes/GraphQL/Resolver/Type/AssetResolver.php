<?php

/** @noinspection PhpUnusedParameterInspection */
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

use Flowpack\Media\Ui\Domain\Model\HierarchicalAssetCollectionInterface;
use Flowpack\Media\Ui\GraphQL\Context\AssetSourceContext;
use Flowpack\Media\Ui\GraphQL\Types;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\ProvidesOriginalUriInterface;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\SupportsIptcMetadataInterface;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Service\AssetService;
use Neos\Media\Domain\Service\FileTypeIconService;

use function Wwwision\Types\instantiate;

#[Flow\Scope('singleton')]
class AssetResolver
{

    #[Flow\Inject]
    protected FileTypeIconService $fileTypeIconService;

    #[Flow\Inject]
    protected ResourceManager $resourceManager;

    #[Flow\Inject]
    protected AssetService $assetService;

    #[Flow\Inject]
    protected AssetSourceContext $assetSourceContext;

    /**
     * @var PersistenceManagerInterface
     */
    #[Flow\Inject]
    protected $persistenceManager;

    /**
     * Returns the title of the associated local asset data or the label of the proxy as fallback
     */
    public function label(Types\Asset $asset): ?string
    {
        $localAssetData = $this->assetSourceContext->getAssetByLocalIdentifier($asset->localId);
        if ($localAssetData && $localAssetData->getTitle()) {
            return $localAssetData->getTitle();
        }
        $assetProxy = $this->assetSourceContext->getAssetProxy($asset->id, $asset->assetSource->id);
        return $assetProxy?->getLabel();
    }

    /**
     * Returns true if the asset is at least used once
     */
    public function isInUse(Types\Asset $asset): bool
    {
        if (!$asset->localId) {
            return false;
        }
        $localAssetData = $this->assetSourceContext->getAssetByLocalIdentifier($asset->localId);
        return $localAssetData && $this->assetService->isInUse($localAssetData);
    }

    /**
     * Returns the caption of the associated local asset data
     */
    public function caption(Types\Asset $asset): ?string
    {
        $localAssetData = $this->assetSourceContext->getAssetByLocalIdentifier($asset->localId);
        return $localAssetData instanceof Asset ? $localAssetData->getCaption() : null;
    }

    public function imported(Types\Asset $asset): bool
    {
        $assetProxy = $this->assetSourceContext->getAssetProxy($asset->id, $asset->assetSource->id);
        // TODO: Find better way to make sure the asset originates from somewhere outside Neos
        return $assetProxy?->getLocalAssetIdentifier() && $assetProxy?->getAssetSource()->getIdentifier() !== 'neos';
    }

    /**
     * Returns a matching icon uri for the given asset-proxy
     */
    public function file(Types\Asset $asset): ?Types\File
    {
        $assetProxy = $this->assetSourceContext->getAssetProxy($asset->id, $asset->assetSource->id);

        if (!$assetProxy) {
            return null;
        }

        $icon = $this->fileTypeIconService::getIcon($assetProxy->getFilename());

        if ($asset instanceof ProvidesOriginalUriInterface) {
            $url = (string)$assetProxy->getOriginalUri();
        } else {
            $url = (string)$assetProxy->getPreviewUri();
        }

        return instantiate(Types\File::class, [
            'extension' => $icon['alt'],
            'mediaType' => $assetProxy->getMediaType(),
            'typeIcon' => [
                'width' => 16,
                'height' => 16,
                'url' => $this->resourceManager->getPublicPackageResourceUriByPath($icon['src']),
                'alt' => $icon['alt'],
            ],
            'size' => $assetProxy->getFileSize(),
            'url' => $url,
        ]);
    }

//    /**
//     * Returns the iptc properties for assetproxies that implement the interface
//     */
//    public function iptcProperty(AssetProxyInterface $assetProxy, array $variables): ?string
//    {
//        $iptcProperties = $this->iptcProperties($assetProxy);
//        return $iptcProperties[$variables['property']] ?? null;
//    }

    /**
     * Returns the iptc properties for asset-proxies that implement the interface
     */
    public function iptcProperties(Types\Asset $asset): Types\IptcProperties
    {
        $assetProxy = $this->assetSourceContext->getAssetProxy($asset->id, $asset->assetSource->id);
        if ($assetProxy instanceof SupportsIptcMetadataInterface) {
            $properties = $assetProxy->getIptcProperties();
            return Types\IptcProperties::fromArray(
                array_map(static function ($key) use ($properties) {
                    return instantiate(
                        Types\IptcProperty::class,
                        ['propertyName' => $key, 'value' => $properties[$key]]
                    );
                }, array_keys($properties))
            );
        }
        return Types\IptcProperties::empty();
    }

    public function copyrightNotice(Types\Asset $asset): ?string
    {
        $localAssetData = $this->assetSourceContext->getAssetByLocalIdentifier($asset->localId);
        return $localAssetData instanceof Asset ? $localAssetData->getCopyrightNotice() : null;
    }

    public function lastModified(Types\Asset $asset): ?string
    {
        $assetProxy = $this->assetSourceContext->getAssetProxy($asset->id, $asset->assetSource->id);
        return $assetProxy?->getLastModified() ? $assetProxy?->getLastModified()->format(DATE_W3C) : null;
    }

    public function tags(Types\Asset $asset): Types\Tags
    {
        $localAssetData = $this->assetSourceContext->getAssetByLocalIdentifier($asset->localId);
        return $localAssetData instanceof Asset ?
            Types\Tags::fromArray(
                array_map(function (Tag $tag) {
                    return instantiate(Types\Tag::class, [
                        'id' => $this->persistenceManager->getIdentifierByObject($tag),
                        'label' => $tag->getLabel(),
                    ]);
                }, $localAssetData->getTags()->toArray())
            ) : Types\Tags::empty();
    }

    public function collections(Types\Asset $asset): Types\AssetCollections
    {
        $localAssetData = $this->assetSourceContext->getAssetByLocalIdentifier($asset->localId);
        return $localAssetData instanceof Asset ?
            Types\AssetCollections::fromArray(
                array_map(function (HierarchicalAssetCollectionInterface $assetCollection) {
                    return instantiate(Types\AssetCollection::class, [
                        'id' => $this->persistenceManager->getIdentifierByObject($assetCollection),
                        'title' => $assetCollection->getTitle(),
                        'path' => $assetCollection->getPath() ?
                            Types\AssetCollectionPath::fromString($assetCollection->getPath()) : '',
                    ]);
                },
                    $localAssetData->getAssetCollections()->toArray())
            ) : Types\AssetCollections::empty();
    }

    public function thumbnailUrl(Types\Asset $asset): ?Types\Url
    {
        $assetProxy = $this->assetSourceContext->getAssetProxy($asset->id, $asset->assetSource->id);
        return $assetProxy ? Types\Url::fromString((string)$assetProxy->getThumbnailUri()) : null;
    }

    public function previewUrl(Types\Asset $asset): ?Types\Url
    {
        $assetProxy = $this->assetSourceContext->getAssetProxy($asset->id, $asset->assetSource->id);
        return $assetProxy ? Types\Url::fromString((string)$assetProxy->getPreviewUri()) : null;
    }
//
//    public function thumbnail(
//        AssetProxyInterface $assetProxy,
//        int $maximumWidth,
//        int $maximumHeight,
//        string $ratioMode,
//        bool $allowUpScaling,
//        bool $allowCropping
//    ): array {
//        // TODO: Implement
//        throw new \RuntimeException('Not implemented yet', 1590840085);
//    }
}
