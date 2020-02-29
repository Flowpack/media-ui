<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver\Type;

use Neos\Flow\Annotations as Flow;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Repository\AssetRepository;
use t3n\GraphQL\ResolverInterface;

class AssetProxyResolver implements ResolverInterface
{
    /**
     * @Flow\Inject
     * @var AssetRepository
     */
    protected $assetRepository;

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
}
