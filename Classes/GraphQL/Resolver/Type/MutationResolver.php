<?php
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

use Flowpack\Media\Ui\Exception;
use Flowpack\Media\Ui\GraphQL\Context\AssetSourceContext;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\Exception\IllegalObjectTypeException;
use Neos\Media\Domain\Model\AssetSource\AssetProxy\AssetProxyInterface;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Exception\AssetServiceException;
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
     * @return bool
     * @throws Exception
     * @throws AssetServiceException
     */
    public function deleteAsset($_, array $variables, AssetSourceContext $assetSourceContext): bool
    {
        [
            'id' => $id,
            'assetSource' => $assetSource,
        ] = $variables;

        [$assetProxy, $asset] = $assetSourceContext->getAssetForProxy($id, $assetSource);

        try {
            $this->assetRepository->remove($asset);
        } catch (IllegalObjectTypeException $e) {
            throw new Exception('Failed to delete asset', 1591537315);
        }

        return true;
    }

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
            'label' => $label,
            'caption' => $caption
        ] = $variables + ['label' => null, 'caption' => null];

        [$assetProxy, $asset] = $assetSourceContext->getAssetForProxy($id, $assetSource);

        if (!$asset) {
            throw new Exception('Cannot update asset that was never imported', 1590659044);
        }

        if ($label !== null) {
            $asset->setTitle($label);
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
