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

use Flowpack\Media\Ui\GraphQL\Types;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Media\Domain\Model\Adjustment\CropImageAdjustment;
use Neos\Media\Domain\Model\ImageVariant;
use Neos\Media\Domain\Repository\ImageVariantRepository;

use function Wwwision\Types\instantiate;

#[Flow\Scope('singleton')]
final class AssetVariantResolver
{
    public function __construct(
        protected readonly ResourceManager $resourceManager,
        protected readonly ImageVariantRepository $imageVariantRepository,
    ) {
    }

    /**
     * Returns a preview url for image variants
     */
    public function previewUrl(Types\AssetVariant $assetVariant): ?Types\Url
    {
        $imageVariant = $this->imageVariantRepository->findByIdentifier($assetVariant->id->value);
        return $imageVariant ? instantiate(
            Types\Url::class,
            $this->resourceManager->getPublicPersistentResourceUri($imageVariant->getResource())
        ) : null;
    }

    public function hasCrop(Types\AssetVariant $assetVariant): bool
    {
        $imageVariant = $this->imageVariantRepository->findByIdentifier($assetVariant->id->value);
        foreach ($imageVariant?->getAdjustments() as $adjustment) {
            if ($adjustment instanceof CropImageAdjustment) {
                return true;
            }
        }
        return false;
    }

    public function cropInformation(Types\AssetVariant $assetVariant): Types\CropInformation
    {
        $imageVariant = $this->imageVariantRepository->findByIdentifier($assetVariant->id->value);
        if (!$imageVariant instanceof ImageVariant) {
            return Types\CropInformation::empty();
        }
        $cropInformation = [];
        foreach ($imageVariant?->getAdjustments() as $adjustment) {
            if (!$adjustment instanceof CropImageAdjustment) {
                continue;
            }
            $cropInformation = [
                'width' => $adjustment->getWidth(),
                'height' => $adjustment->getHeight(),
                'x' => $adjustment->getX(),
                'y' => $adjustment->getY(),
            ];
            $aspectRatio = $adjustment->getAspectRatio();
            if ($aspectRatio !== null) {
                [
                    $x,
                    $y,
                    $width,
                    $height
                ] = CropImageAdjustment::calculateDimensionsByAspectRatio(
                    $imageVariant->getOriginalAsset()->getWidth(),
                    $imageVariant->getOriginalAsset()->getHeight(), $aspectRatio
                );
                $cropInformation = [
                    'width' => $width,
                    'height' => $height,
                    'x' => $x,
                    'y' => $y,
                ];
            }
        }
        return instantiate(Types\CropInformation::class, $cropInformation);
    }
}
