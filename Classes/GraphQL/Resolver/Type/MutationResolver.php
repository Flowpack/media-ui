<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver\Type;

use Flowpack\Media\Ui\GraphQL\Context\AssetSourceContext;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\Exception\IllegalObjectTypeException;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Exception;
use t3n\GraphQL\ResolverInterface;

/**
 * @Flow\Scope("singleton")
 */
class MutationResolver implements ResolverInterface
{

    /**
     * @Flow\Inject
     * @var AssetRepository
     */
    protected $assetRepository;

    /**
     * @param $_
     * @param array $variables
     * @param AssetSourceContext $assetSourceContext
     * @return AssetProxyInterface|null
     * @throws Exception
     */
    public function updateAsset($_, array $variables, AssetSourceContext $assetSourceContext): ?AssetProxyInterface
    {
        [
            'id' => $id,
            'assetSource' => $assetSource,
            'title' => $title,
            'caption' => $caption
        ] = $variables + ['title' => null, 'caption' => null];

        $activeAssetSource = $assetSourceContext->getAssetSource($assetSource);

        if (!$activeAssetSource) {
            return null;
        }

        $assetProxy = $activeAssetSource->getAssetProxyRepository()->getAssetProxy($id);

        if (!$assetProxy) {
            return null;
        }

        $assetIdentifier = $assetProxy->getLocalAssetIdentifier();

        /** @var Asset $asset */
        $asset = $this->assetRepository->findByIdentifier($assetIdentifier);

        if (!$asset) {
            throw new Exception('Cannot update asset that was never imported', 1590659044);
        }

        if ($title !== null) {
            $asset->setTitle($title);
        }

        if ($caption !== null) {
            $asset->setCaption($caption);
        }

        try {
            $this->assetRepository->update($asset);
        } catch (IllegalObjectTypeException $e) {
            throw new Exception('Failed to update asset', 1590659063);
        }

        return $assetProxy;
    }
}
