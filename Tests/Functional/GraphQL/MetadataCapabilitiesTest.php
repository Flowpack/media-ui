<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Tests\Functional\GraphQL;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Flowpack\Media\Ui\Controller\MediaController;
use Flowpack\Media\Ui\GraphQL\MediaApi;
use Flowpack\Media\Ui\GraphQL\Resolver\Type\AssetResolver;
use Flowpack\Media\Ui\GraphQL\Types;
use Flowpack\Media\Ui\Tests\Functional\AbstractMediaTestCase;
use Neos\Flow\Persistence\Doctrine\PersistenceManager;
use Neos\Flow\Tests\Behavior\Features\Bootstrap\SecurityOperationsTrait;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\MetaData\Domain\Dto\MetaDataAssetReference;
use Neos\MetaData\Domain\Dto\MetaDataPropertyDefinitions;
use Neos\MetaData\Domain\Dto\MetaDataPropertyName;
use Neos\MetaData\Domain\Dto\MetaDataPropertyValue;
use Neos\MetaData\Domain\Dto\MetaDataPropertyValues;
use Neos\MetaData\MetaDataManager;
use ReflectionMethod;

/**
 * Verifies the metadata editing capabilities that are only available when the optional
 * Neos.MetaData package is installed.
 *
 * These tests are tagged "metadata-capabilities", so the default functional test run excludes
 * them. They are only executed after the Neos.MetaData package has been installed (see CI).
 *
 * @group metadata-capabilities
 */
class MetadataCapabilitiesTest extends AbstractMediaTestCase
{
    use SecurityOperationsTrait;

    /**
     * @var bool
     */
    protected static $testablePersistenceEnabled = true;

    protected MediaApi $mediaApi;
    protected MetaDataManager $metaDataManager;
    protected MediaController $mediaController;
    protected AssetResolver $assetResolver;
    protected AssetRepository $assetRepository;
    protected false $isolated;

    protected function setUp(): void
    {
        parent::setUp();
        $this->isolated = false;
        if (!$this->persistenceManager instanceof PersistenceManager) {
            static::markTestSkipped('Doctrine persistence is not enabled');
        }

        $this->mediaApi = $this->objectManager->get(MediaApi::class);
        $this->metaDataManager = $this->objectManager->get(MetaDataManager::class);
        $this->mediaController = $this->objectManager->get(MediaController::class);
        $this->assetResolver = $this->objectManager->get(AssetResolver::class);
        $this->assetRepository = $this->objectManager->get(AssetRepository::class);

        $this->iAmAuthenticatedWithRole('Neos.Neos:Editor');
    }

    /**
     * @test
     */
    public function configExposesMetadataEditingSupport(): void
    {
        self::assertTrue($this->mediaApi->config()->supportsMetadataEditing);
    }

    /**
     * @test
     */
    public function defaultMetadataPropertiesAreConfigured(): void
    {
        $definitions = $this->metaDataManager->getPropertyDefinitions();

        self::assertTrue($definitions->include(MetaDataPropertyName::fromString('caption')));
        self::assertTrue($definitions->include(MetaDataPropertyName::fromString('copyright')));
        self::assertTrue($definitions->include(MetaDataPropertyName::fromString('altText')));

        self::assertFalse($definitions->get(MetaDataPropertyName::fromString('caption'))->globalScope);
        self::assertTrue($definitions->get(MetaDataPropertyName::fromString('copyright'))->globalScope);
    }

    /**
     * @test
     */
    public function metadataPropertiesAreMappedToAnEditorFormSchema(): void
    {
        $definitions = $this->metaDataManager->getPropertyDefinitions();

        $formSchema = $this->mapPropertyDefinitions($definitions);

        self::assertArrayHasKey('caption', $formSchema);
        self::assertArrayHasKey('copyright', $formSchema);

        $caption = $formSchema['caption'];
        self::assertSame('string', $caption['type']);
        self::assertSame('textarea', $caption['editor']);
        self::assertFalse($caption['globalScope']);
        self::assertFalse($caption['value']->hasOwnValue());

        self::assertTrue($formSchema['copyright']['globalScope']);
    }

    /**
     * @test
     */
    public function assetResolverExposesMetadataFromMetaDataManager(): void
    {
        $file = self::createFile();
        $this->mediaApi->uploadFiles(
            Types\UploadedFiles::fromArray([$file]),
            Types\AssetSourceId::default(),
        );
        $this->persistenceManager->persistAll();

        $asset = $this->mediaApi->assets(Types\AssetSourceId::default())->assets[0];
        $assetEntity = $this->assetRepository->findByIdentifier($asset->id->value);

        $assetReference = MetaDataAssetReference::create(
            $asset->assetSource->id->value,
            $assetEntity->getIdentifier()
        );
        $this->metaDataManager->setMetaDataPropertyValue($assetReference, 'caption', 'The caption');
        $this->persistenceManager->persistAll();

        $metadata = $this->assetResolver->metadata($asset);

        $captions = array_values(array_filter(
            iterator_to_array($metadata),
            static fn (Types\MetaDataProperty $property) => $property->propertyName->value === 'caption'
        ));

        self::assertCount(1, $captions);
        self::assertSame('The caption', $captions[0]->value);
    }

    /**
     * @test
     */
    public function assetResolverOmitsMetadataPropertiesWithoutValue(): void
    {
        $file = self::createFile();
        $this->mediaApi->uploadFiles(
            Types\UploadedFiles::fromArray([$file]),
            Types\AssetSourceId::default(),
        );
        $this->persistenceManager->persistAll();

        $asset = $this->mediaApi->assets(Types\AssetSourceId::default())->assets[0];

        $metadata = $this->assetResolver->metadata($asset);

        // No metadata value is set, so all properties must be omitted
        self::assertCount(0, $metadata->properties);
    }

    /**
     * @test
     */
    public function assetResolverEscapesMetadataValues(): void
    {
        $file = self::createFile();
        $this->mediaApi->uploadFiles(
            Types\UploadedFiles::fromArray([$file]),
            Types\AssetSourceId::default(),
        );
        $this->persistenceManager->persistAll();

        $asset = $this->mediaApi->assets(Types\AssetSourceId::default())->assets[0];
        $assetEntity = $this->assetRepository->findByIdentifier($asset->id->value);

        $assetReference = MetaDataAssetReference::create(
            $asset->assetSource->id->value,
            $assetEntity->getIdentifier()
        );
        $this->metaDataManager->setMetaDataPropertyValue($assetReference, 'caption', '<script>alert("xss")</script>');
        $this->persistenceManager->persistAll();

        $metadata = $this->assetResolver->metadata($asset);

        $captions = array_values(array_filter(
            iterator_to_array($metadata),
            static fn (Types\MetaDataProperty $property) => $property->propertyName->value === 'caption'
        ));

        self::assertCount(1, $captions);
        self::assertSame(
            '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
            $captions[0]->value
        );
    }

    /**
     * @return array<string, array{type: string, editor: string|null, editorOptions: array, label: string, globalScope: bool, value: MetaDataPropertyValue}>
     */
    private function mapPropertyDefinitions(MetaDataPropertyDefinitions $definitions): array
    {
        $propertyValues = MetaDataPropertyValues::createEmpty();
        foreach ($definitions as $definition) {
            $propertyValues = $propertyValues->with($definition->name, MetaDataPropertyValue::createEmpty());
        }

        $method = new ReflectionMethod(MediaController::class, 'mapPropertyDefinitions');
        return $method->invoke($this->mediaController, $definitions, $propertyValues);
    }
}