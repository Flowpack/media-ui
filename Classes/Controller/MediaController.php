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
use Neos\MetaData\Domain\Dto\MetaDataPropertyDefinitions;
use Neos\MetaData\Domain\Dto\MetaDataPropertyName;
use Neos\MetaData\Domain\Dto\MetaDataPropertyValues;
use Neos\MetaData\MetaDataManager;
use Neos\Neos\Controller\Module\AbstractModuleController;

#[Flow\Scope('singleton')]
class MediaController extends AbstractModuleController
{
    #[Flow\Inject]
    protected AssetSourceContext $assetSourceContext;

    #[Flow\Inject]
    protected AssetService $assetService;

    #[Flow\Inject]
    protected Translator $translator;

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
            $dimensionSpacePoint = $dimensionSpacePoints->getIterator()->current();
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
        // Values of the parent dimension if exists, to show the fallback value before overriding
        $propertyValuesOfParentWithFallback = $this->metaDataManager->getMetaDataPropertyValuesOfParentWithFallback(
            $assetReference,
            $dimensionSpacePoint
        );

        $propertyDefinitions = $this->mapPropertyDefinitions(
            $metaDataPropertyDefinitions, $propertyValues, $propertyValuesOfParentWithFallback
        );

        $assetIdentity = AssetIdentity::create($assetId, $assetSourceId);

        $hasOnlyEmptyDsp = false;
        if ($dimensionSpacePoints->count() === 1) {
            /** @var MetaDataDimensionSpacePoint $dimensionSpacePoint */
            $dimensionSpacePoint = $dimensionSpacePoints->getIterator()->current();
            $hasOnlyEmptyDsp = $dimensionSpacePoint->equals(MetaDataDimensionSpacePoint::fromCoordinates([]));
        }

        $this->view->assignMultiple([
            'formSchema' => $propertyDefinitions,
            'asset' => $asset,
            'assetIdentity' => $assetIdentity,
            'assetDsps' => !$hasOnlyEmptyDsp ? $dimensionSpacePoints : [],
            'currentAssetDsp' => $metaDataDimensionSpacePointHash ?: $dimensionSpacePoint?->hash,
        ]);
    }

    /**
     * @return array {type: string, editor: string|null, label: string, value: string|null}[]
     */
    protected function mapPropertyDefinitions(
        ?MetaDataPropertyDefinitions $metaDataPropertyDefinitions,
        MetaDataPropertyValues $propertyValues,
        MetaDataPropertyValues $propertyValuesOfParentWithFallback,
    ): array {
        if (!isset($metaDataPropertyDefinitions) || iterator_count(
                $metaDataPropertyDefinitions->getIterator()
            ) === 0) {
            return [];
        }

        $config = [];
        foreach ($metaDataPropertyDefinitions as $propertyDefinition) {
            $propertyName = $propertyDefinition->name->value;
            $config[$propertyName] = [
                'type' => $propertyDefinition->type->name,
                'editor' => $propertyDefinition->ui->editorDefinition->editorType === 'Neos.Neos/Inspector/Editors/TextAreaEditor' ? 'textarea' : null,
                'label' => $propertyDefinition->ui->label,
            ];

            foreach ($propertyValues as $propertyValueName => $propertyValue) {
                if ($propertyValueName->equals($propertyName)) {
                    $config[$propertyName]['value'] = $propertyValue;
                }
            }

            foreach ($propertyValuesOfParentWithFallback as $propertyValueName => $propertyValue) {
                if ($propertyValueName->equals($propertyName)) {
                    $config[$propertyName]['parentFallbackValue'] = $propertyValue;
                }
            }
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

    private function getDimensionSpacePointFromHash(string $dimensionSpacePointHash): ?MetaDataDimensionSpacePoint
    {
        $dimensionSpacePoints = $this->metaDataManager->getDimensionSpacePointConfiguration();
        return current(array_filter(
            iterator_to_array($dimensionSpacePoints),
            fn($spacePoint) => $spacePoint->hash === $dimensionSpacePointHash
        )) ?? null;
    }
}
