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
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Service\AssetService;
use Neos\MetaData\Domain\Dto\MetaDataAssetReference;
use Neos\MetaData\Domain\Dto\MetaDataDimensionSpacePoint;
use Neos\MetaData\Domain\Dto\MetaDataDimensionSpacePoints;
use Neos\MetaData\Domain\Dto\MetaDataPropertyDefinitions;
use Neos\MetaData\Domain\Dto\MetaDataPropertyName;
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

    public function initializeAction()
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
        AssetId $assetId,
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
        $asset = $this->assetSourceContext->getAsset($assetId, $assetSourceId);
        if ($asset === null) {
            return;
        }

        $assetReference = MetaDataAssetReference::create($assetSourceId->value, $assetId->value);
        $propertyValues = $this->metaDataManager->getMetaDataPropertyValues(
            $assetReference,
            $dimensionSpacePoint
        );

        $propertyDefinitions = $this->mapPropertyDefinitions(
            $metaDataPropertyDefinitions,
            $propertyValues
        );

        $assetIdentity = AssetIdentity::create($assetId, $assetSourceId);

        $hasOnlyEmptyDsp = false;
        if ($dimensionSpacePoints->count() === 1) {
            /** @var MetaDataDimensionSpacePoint $dimensionSpacePoint */
            $dimensionSpacePoint = $this->getFirstDimensionSpacePoint($dimensionSpacePoints);
            $hasOnlyEmptyDsp = $dimensionSpacePoint->equals(MetaDataDimensionSpacePoint::fromCoordinates([]));
        }

        $this->view->assignMultiple([
            'formSchema' => $propertyDefinitions,
            'asset' => $asset,
            'assetIdentity' => $assetIdentity,
            'assetDsps' => !$hasOnlyEmptyDsp ? $this->mapDimensionSpacePointsToDtos($dimensionSpacePoints) : [],
            'currentAssetDsp' => $metaDataDimensionSpacePointHash ?: $dimensionSpacePoint?->hash,
        ]);
    }

    /**
     * @return array {type: string, editor: string|null, label: string, value: string|null}[]
     */
    protected function mapPropertyDefinitions(
        ?MetaDataPropertyDefinitions $metaDataPropertyDefinitions,
        MetaDataPropertyValues $propertyValues,
    ): array {
        if (!isset($metaDataPropertyDefinitions) || iterator_count(
                $metaDataPropertyDefinitions->getIterator()
            ) === 0) {
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
                'editor' => $propertyDefinition->ui->editorDefinition->editorType === 'Neos.Neos/Inspector/Editors/TextAreaEditor' ? 'textarea' : null,
                'editorOptions' => $propertyDefinition->ui->editorDefinition->options,
                'label' => $propertyDefinition->ui->label,
                'globalScope' => $propertyDefinition->globalScope,
                'value' => $propertyValues->get(MetaDataPropertyName::fromString($propertyName)),
            ];
        }
        return $config;
    }

    /**
     * @param string[] $postData
     * @throws StopActionException
     */
    public function updateMetadataAction(
        Asset $asset,
        string $metaDataDimensionSpacePointHash,
        array $postData,
    ): void {
        $assetIdentity = AssetIdentity::create(
            AssetId::fromString($this->persistenceManager->getIdentifierByObject($asset)),
            new AssetSourceId($asset->getAssetSourceIdentifier())
        );

        $metaDataDimensionSpacePoint = $this->getDimensionSpacePointFromHash($metaDataDimensionSpacePointHash);

        foreach ($postData as $propertyName => $propertyValue) {
            $this->metaDataManager->setMetaDataPropertyValue(
                MetaDataAssetReference::create($assetIdentity->assetSourceId->value, $assetIdentity->assetId->value),
                MetaDataPropertyName::fromString($propertyName),
                $propertyValue,
                $metaDataDimensionSpacePoint,
            );
        }
        $this->assetService->emitAssetUpdated($asset);
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
                    'valueLabel' => $this->resolvePresetLabel($dimensionConfiguration['presets'] ?? [], $dimensionValue) ?? $dimensionValue,
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

    private function getFirstDimensionSpacePoint(MetaDataDimensionSpacePoints $dimensionSpacePoints): ?MetaDataDimensionSpacePoint
    {
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
