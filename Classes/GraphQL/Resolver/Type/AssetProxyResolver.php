<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver\Type;

use Neos\Flow\Annotations as Flow;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
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
     * @return array
     */
    public function fileTypeIcon(AssetProxyInterface $assetProxy): array
    {
        $icon = $this->fileTypeIconService->getIcon($assetProxy->getFilename());
        $icon['src'] = $this->resourceManager->getPublicPackageResourceUriByPath($icon['src']);
        return $icon;
    }
}
