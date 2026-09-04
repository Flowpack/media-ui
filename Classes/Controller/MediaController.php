<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Controller;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Flowpack\Media\Ui\GraphQL\Context\AssetSourceContext;
use Flowpack\Media\Ui\GraphQL\Types\AssetId;
use Flowpack\Media\Ui\GraphQL\Types\AssetIdentity;
use Flowpack\Media\Ui\GraphQL\Types\AssetSourceId;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\I18n\Translator;
use Neos\Flow\Mvc\Exception\StopActionException;
use Neos\Fusion\View\FusionView;
use Neos\Media\Domain\Service\AssetService;
use Neos\MetaData\Domain\Dto\MetaDataAssetReference;
use Neos\MetaData\Domain\Dto\MetaDataDimensionSpacePoint;
use Neos\MetaData\Domain\Dto\MetaDataDimensionSpacePoints;
use Neos\MetaData\Domain\Dto\MetaDataPropertyDefinitions;
use Neos\MetaData\Domain\Dto\MetaDataPropertyName;
use Neos\MetaData\Domain\Dto\MetaDataPropertyValue;
use Neos\MetaData\Domain\Dto\MetaDataPropertyValues;
use Neos\MetaData\MetaDataManager;
use Neos\Neos\Controller\Module\AbstractModuleController;
use Neos\Neos\Domain\Service\ConfigurationContentDimensionPresetSource;

#[Flow\Scope('singleton')]
class MediaController extends AbstractModuleController
{
    #[Flow\Inject]
    protected AssetSourceContext $assetSourceContext;

    #[Flow\Inject]
    protected AssetService $assetService;

    #[Flow\Inject]
    protected Translator $translator;

    #[Flow\Inject]
    protected ConfigurationContentDimensionPresetSource $contentDimensionPresetSource;

    /**
     * @var FusionView
     */
    protected $view;

    /**
     * @inheritdoc
     */
    protected $defaultViewObjectName = FusionView::class;

    /**
     * @inheritdoc
     */
    protected $viewFormatToObjectNameMap = [
        'html' => FusionView::class,
    ];

    protected ?MetaDataManager $metaDataManager;

    public function initializeAction(): void
    {
        $this->metaDataManager = $this->objectManager->has(MetaDataManager::class)
            ? $this->objectManager->get(MetaDataManager::class)
            : null;
        parent::initializeAction();
    }

    /**
     * Renders the media ui application
     */
    public function indexAction(): void
    {
    }

    public function editMetadataAction(
        string $assetIds,
        AssetSourceId $assetSourceId,
        ?string $metaDataDimensionSpacePointHash = null,
    ): void {
        if ($this->metaDataManager === null) {
            return;
        }
        $metaDataPropertyDefinitions = $this->metaDataManager->getPropertyDefinitions();
        $dimensionSpacePoints = $this->metaDataManager->getDimensionSpacePointConfiguration();
        if ($metaDataDimensionSpacePointHash !== null) {
            $dimensionSpacePoint = $this->getDimensionSpacePointFromHash($metaDataDimensionSpacePointHash);
        }
        if ($metaDataDimensionSpacePointHash === null || $dimensionSpacePoint === null) {
            $dimensionSpacePoint = $this->getFirstDimensionSpacePoint($dimensionSpacePoints);
        }

        try {
            $assetIdentities = array_map(
                static fn(string $assetId) => AssetIdentity::create(
                    AssetId::fromString($assetId),
                    $assetSourceId
                ),
                json_decode($assetIds, false, 512, JSON_THROW_ON_ERROR)
            );
        } catch (\Exception) {
            $assetIdentities = [];
        }
        /** @var AssetIdentity[] $assetIdentities */

        $assetsWithMetadata = array_filter(array_map(function (AssetIdentity $assetIdentity) use (
            $dimensionSpacePoint,
            $metaDataPropertyDefinitions
        ) {
            $asset = $this->assetSourceContext->getAsset($assetIdentity->assetId, $assetIdentity->assetSourceId);
            if (!$asset) {
                return null;
            }

            $assetReference = MetaDataAssetReference::create(
                $assetIdentity->assetSourceId->value,
                $assetIdentity->assetId->value
            );

            $propertyValues = $this->metaDataManager->getMetaDataPropertyValues(
                $assetReference,
                $dimensionSpacePoint
            );

            $propertyDefinitions = $this->mapPropertyDefinitions(
                $metaDataPropertyDefinitions,
                $propertyValues
            );

            return [
                'assetIdentity' => $assetIdentity,
                'asset' => $asset,
                'formSchema' => $propertyDefinitions,
            ];
        }, $assetIdentities));

        $hasOnlyEmptyDsp = false;
        if ($dimensionSpacePoints->count() === 1) {
            /** @var MetaDataDimensionSpacePoint $dimensionSpacePoint */
            $dimensionSpacePoint = $this->getFirstDimensionSpacePoint($dimensionSpacePoints);
            $hasOnlyEmptyDsp = $dimensionSpacePoint->equals(MetaDataDimensionSpacePoint::fromCoordinates([]));
        }

        $this->view->assignMultiple([
            'assetsWithMetadata' => $assetsWithMetadata,
            'assetDsps' => !$hasOnlyEmptyDsp ? $this->mapDimensionSpacePointsToDtos($dimensionSpacePoints) : [],
            'currentAssetDsp' => $metaDataDimensionSpacePointHash ?: $dimensionSpacePoint?->hash,
        ]);
    }

    /**
     * @return array<string, array{type: string, editor: string|null, label: string, value: MetaDataPropertyValue}>
     */
    protected function mapPropertyDefinitions(
        ?MetaDataPropertyDefinitions $metaDataPropertyDefinitions,
        MetaDataPropertyValues $propertyValues,
    ): array {
        try {
            if (!isset($metaDataPropertyDefinitions) || iterator_count(
                    $metaDataPropertyDefinitions->getIterator()
                ) === 0) {
                return [];
            }
        } catch (\Exception) {
            return [];
        }

        $config = [];
        foreach ($metaDataPropertyDefinitions as $propertyDefinition) {
            if ($propertyDefinition->ui === null) {
                continue;
            }
            $propertyName = $propertyDefinition->name->value;
            $config[$propertyName] = [
                'type' => $propertyDefinition->type->name,
                'editor' => $propertyDefinition->ui->editorDefinition->editorType,
                'editorOptions' => $propertyDefinition->ui->editorDefinition->options,
                'label' => $propertyDefinition->ui->label,
                'globalScope' => $propertyDefinition->globalScope,
                'value' => $propertyValues->get(MetaDataPropertyName::fromString($propertyName)),
            ];
        }
        return $config;
    }

    /**
     * @param array<array{assetId: string, postData: array<string, mixed>|null}> $assets
     * @throws StopActionException
     */
    public function updateMetadataAction(
        array $assets,
        string $metaDataDimensionSpacePointHash,
        AssetSourceId $assetSourceId,
    ): void {
        $metaDataDimensionSpacePoint = $this->getDimensionSpacePointFromHash($metaDataDimensionSpacePointHash);

        foreach ($assets as $assetData) {
            $assetIdentity = AssetIdentity::create(
                AssetId::fromString($assetData['assetId']),
                $assetSourceId,
            );

            $asset = $this->assetSourceContext->getAsset($assetIdentity->assetId, $assetSourceId);
            if ($asset === null) {
                continue;
            }

            foreach ($assetData['postData'] ?? [] as $propertyName => $propertyValue) {
                $this->metaDataManager->setMetaDataPropertyValue(
                    MetaDataAssetReference::create($assetIdentity->assetSourceId->value,
                        $assetIdentity->assetId->value),
                    MetaDataPropertyName::fromString($propertyName),
                    $propertyValue,
                    $metaDataDimensionSpacePoint,
                );
            }
            $this->assetService->emitAssetUpdated($asset);
        }
        $this->redirect('index');
    }

    /**
     * Converts the configured dimension space points into displayable dtos with the dimensions' and
     * presets' labels resolved, so that the dimension switcher can show them instead of the configuration keys.
     *
     * @return array<array{hash: string, coordinates: list<array{dimensionLabel: string, valueLabel: string}>}>
     */
    private function mapDimensionSpacePointsToDtos(MetaDataDimensionSpacePoints $dimensionSpacePoints): array
    {
        $presets = $this->contentDimensionPresetSource->getAllPresets();
        $dtos = [];
        foreach ($dimensionSpacePoints as $dimensionSpacePoint) {
            $coordinates = [];
            foreach ($dimensionSpacePoint->coordinates as $dimensionName => $dimensionValue) {
                $dimensionConfiguration = $presets[$dimensionName] ?? null;
                $coordinates[] = [
                    'dimensionLabel' => $dimensionConfiguration['label'] ?? $dimensionName,
                    'valueLabel' => $this->resolvePresetLabel($dimensionConfiguration['presets'] ?? [],
                            $dimensionValue) ?? $dimensionValue,
                ];
            }
            $dtos[] = [
                'hash' => $dimensionSpacePoint->hash,
                'coordinates' => $coordinates,
            ];
        }

        return $dtos;
    }

    /**
     * @param array<string, array{values: list<string>, label: string|null}> $presets
     */
    private function resolvePresetLabel(array $presets, string $dimensionValue): ?string
    {
        foreach ($presets as $presetConfiguration) {
            if (isset($presetConfiguration['values'][0]) && $presetConfiguration['values'][0] === $dimensionValue) {
                return $presetConfiguration['label'] ?? null;
            }
        }

        return null;
    }

    private function getFirstDimensionSpacePoint(MetaDataDimensionSpacePoints $dimensionSpacePoints
    ): ?MetaDataDimensionSpacePoint {
        foreach ($dimensionSpacePoints as $dimensionSpacePoint) {
            return $dimensionSpacePoint;
        }

        return null;
    }

    private function getDimensionSpacePointFromHash(string $dimensionSpacePointHash): ?MetaDataDimensionSpacePoint
    {
        $dimensionSpacePoints = $this->metaDataManager->getDimensionSpacePointConfiguration();
        return current(array_filter(
            iterator_to_array($dimensionSpacePoints),
            static fn($spacePoint) => $spacePoint->hash === $dimensionSpacePointHash
        )) ?: null;
    }
}
