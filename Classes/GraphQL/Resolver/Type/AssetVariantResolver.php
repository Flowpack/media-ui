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

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\Doctrine\PersistenceManager;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Media\Domain\Model\Adjustment\CropImageAdjustment;
use Neos\Media\Domain\Model\ImageVariant;

use t3n\GraphQL\ResolverInterface;

/**
 * @Flow\Scope("singleton")
 */
class AssetVariantResolver implements ResolverInterface
{

    /**
     * @Flow\Inject
     * @var PersistenceManager
     */
    public $persistenceManager;

    /**
     * @Flow\Inject
     * @var ResourceManager
     */
    protected $resourceManager;


    public function id(ImageVariant $assetVariant): ?string
    {
        return (string)$this->persistenceManager->getIdentifierByObject($assetVariant);
    }

    public function previewUrl(ImageVariant $assetVariant): string
    {
        return (string)$this->resourceManager->getPublicPersistentResourceUri($assetVariant->getResource());
    }

    public function width(ImageVariant $assetVariant): int
    {
        return $assetVariant->getWidth();
    }

    public function height(ImageVariant $assetVariant): int
    {
        return $assetVariant->getHeight();
    }

    public function presetIdentifier(ImageVariant $assetVariant): ?string
    {
        return $assetVariant->getPresetIdentifier();
    }

    public function variantName(ImageVariant $assetVariant): ?string
    {
        return $assetVariant->getPresetVariantName();
    }

    public function hasCrop(ImageVariant $assetVariant): bool
    {
        foreach ($assetVariant->getAdjustments() as $adjustment) {
            if ($adjustment instanceof CropImageAdjustment) {
                return true;
            }
        }

        return false;
    }

    public function cropInformation(ImageVariant $assetVariant): array
    {
        $cropInformation = [];
        foreach ($assetVariant->getAdjustments() as $adjustment) {
            if ($adjustment instanceof CropImageAdjustment) {
                $cropInformation = [
                    'width' => $adjustment->getWidth(),
                    'height' => $adjustment->getHeight(),
                    'x' => $adjustment->getX(),
                    'y' => $adjustment->getY(),
                ];
                $aspectRatio = $adjustment->getAspectRatio();
                if ($aspectRatio !== null) {
                    [$x, $y, $width, $height] = CropImageAdjustment::calculateDimensionsByAspectRatio($assetVariant->getOriginalAsset()->getWidth(), $assetVariant->getOriginalAsset()->getHeight(), $aspectRatio);
                    $cropInformation = [
                        'width' => $width,
                        'height' => $height,
                        'x' => $x,
                        'y' => $y,
                    ];
                }
            }

        }

        return $cropInformation;
    }
}
