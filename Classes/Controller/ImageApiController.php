<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Controller;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\Controller\ActionController;
use Neos\Flow\Mvc\Exception\StopActionException;
use Neos\Flow\Mvc\Exception\UnsupportedRequestTypeException;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Service\AssetSourceService;

/**
 * @Flow\Scope("singleton")
 */
class ImageApiController extends ActionController
{

    /**
     * @Flow\Inject
     * @var AssetSourceService
     */
    protected $assetSourceService;

    /**
     * @throws StopActionException|UnsupportedRequestTypeException
     */
    public function thumbnailAction(string $assetProxyId, string $assetSourceId): void
    {
        $assetProxy = $this->getAssetProxy($assetSourceId, $assetProxyId);
        $this->redirectToImageUri($assetProxy, 'thumbnail');
    }

    /**
     * @throws StopActionException|UnsupportedRequestTypeException
     */
    public function previewAction(string $assetProxyId, string $assetSourceId): void
    {
        $assetProxy = $this->getAssetProxy($assetSourceId, $assetProxyId);
        $this->redirectToImageUri($assetProxy, 'preview');
    }

    protected function getAssetProxy(string $assetSourceId, string $assetProxyId): AssetProxyInterface {
        $assetSources = $this->assetSourceService->getAssetSources();
        // Get AssetSource matching the given id
        $assetSource = $assetSources[$assetSourceId] ?? null;

        if (!$assetSource) {
            $this->throwStatus(404, 'AssetSource not found');
        }

        $assetProxy = $assetSource->getAssetProxyRepository()->getAssetProxy($assetProxyId);

        if (!$assetProxy) {
            $this->throwStatus(404, 'AssetProxy not found');
        }
        return $assetProxy;
    }

    /**
     * @throws StopActionException|UnsupportedRequestTypeException
     */
    protected function redirectToImageUri(AssetProxyInterface $assetProxy, string $type): void
    {
        $lastModified = $assetProxy->getLastModified();
        $this->response->setHttpHeader('Last-Modified', $lastModified->format('D, d M Y H:i:s') . ' GMT');
        $this->redirectToUri($type === 'thumbnail' ? $assetProxy->getThumbnailUri() : $assetProxy->getPreviewUri(), 0, 301);
    }

}
