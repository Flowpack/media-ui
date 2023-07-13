<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\Controller;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\Controller\ActionController;
use Neos\Flow\Mvc\Exception\StopActionException;
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
     * @throws StopActionException
     */
    public function thumbnailAction(string $assetProxyId, string $assetSourceId): void
    {
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

        $this->redirectToUri($assetProxy->getThumbnailUri());
    }

    /**
     * @throws StopActionException
     */
    public function previewAction(string $assetProxyId, string $assetSourceId): void
    {
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

        $this->redirectToUri($assetProxy->getPreviewUri());
    }
}
