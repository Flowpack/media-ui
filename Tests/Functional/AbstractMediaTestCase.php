<?php
namespace Flowpack\Media\Ui\Tests\Functional;

/*
 * This file is part of the Neos.Media package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Flowpack\Media\Ui\GraphQL\Types;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Flow\ResourceManagement\PersistentResource;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Flow\Tests\FunctionalTestCase;
use Neos\MetaData\Configuration\MetaDataConfigurationProviderYamlAdapter;
use Neos\MetaData\DimensionSpacePointProvider\DimensionSpacePointProvider;
use Neos\MetaData\Domain\Dto\MetaDataAssetReference;
use Neos\MetaData\Domain\Dto\MetaDataDimensionSpacePoint;
use Neos\MetaData\Domain\Dto\MetaDataDimensionSpacePoints;
use Neos\MetaData\Domain\Dto\MetaDataGlobalScope;
use Neos\MetaData\Domain\Dto\MetaDataPropertyName;
use Neos\MetaData\Domain\Dto\MetaDataPropertyNames;
use Neos\MetaData\MetaDataManager;
use Neos\MetaData\MetaDataManagerFactory;
use Neos\MetaData\Storage\MetaDataStorage;
use Neos\Utility\Files;


use function Wwwision\Types\instantiate;

/**
 * Abstract Functional Test template
 */
abstract class AbstractMediaTestCase extends FunctionalTestCase
{
    /**
     * @var string
     */
    protected $temporaryDirectory;

    /**
     * In-memory metadata storage state shared by every {@see MetaDataManager} mock instance.
     *
     * Shared (instead of per instance) so that singletons which keep a reference to a previously
     * registered manager – e.g. the AssetResolver – still read the values written by the current test.
     *
     * @var array<string, array<string, array<string, array<string, string|int|bool>>>>
     */
    protected static array $metaDataStoredValues = [];

    /**
     * @var ResourceManager
     */
    protected $resourceManager;

    /**
     * @inheritDoc
     */
    protected function setUp(): void
    {
        parent::setUp();
    }

    /**
     * Registers a MetaDataManager whose storage is an in-memory mock, so that metadata related
     * functional tests neither require the `neos_metadata_value` database table nor a MySQL database.
     *
     * The MetaDataManager itself is real - only its {@see MetaDataStorage} and
     * {@see DimensionSpacePointProvider} collaborators are mocked. The property definitions are taken
     * from the real configuration provider, so they match the metadata properties configured by the
     * installed packages.
     *
     * The factory is registered as singleton replacement, because the MetaDataManager itself is of
     * prototype scope and therefore cannot be replaced via setInstance.
     */
    protected function mockMetaDataManager(): MetaDataManager
    {
        $dimensionHashOf = static fn (MetaDataDimensionSpacePoint|MetaDataGlobalScope $scope): string =>
            $scope instanceof MetaDataGlobalScope ? 'global' : $scope->hash;

        self::$metaDataStoredValues = [];
        $storageState = &self::$metaDataStoredValues;

        // PHPUnit mocks are not used here on purpose: their stubs are cleared by the framework after each
        // test, but the managers are cached by singletons like the AssetResolver and live across tests.
        $storage = new class($storageState, $dimensionHashOf) implements MetaDataStorage {
            /**
             * @var array<string, array<string, array<string, array<string, string|int|bool>>>>
             */
            private array $storageState;
            private \Closure $dimensionHashOf;

            /**
             * @param array<string, array<string, array<string, array<string, string|int|bool>>>> $storageState
             */
            public function __construct(array &$storageState, \Closure $dimensionHashOf)
            {
                $this->dimensionHashOf = $dimensionHashOf;
                $this->storageState = &$storageState;
            }

            public function setMetaDataPropertyValue(MetaDataAssetReference $assetReference, MetaDataPropertyName $propertyName, string|int|bool $propertyValue, MetaDataDimensionSpacePoint|MetaDataGlobalScope $scope): void
            {
                $this->storageState[$assetReference->assetSourceId][$assetReference->assetId][$propertyName->value][($this->dimensionHashOf)($scope)] = $propertyValue;
            }

            public function unsetMetaDataPropertyValue(MetaDataAssetReference $assetReference, MetaDataPropertyName $propertyName, MetaDataDimensionSpacePoint|MetaDataGlobalScope $scope): void
            {
                unset($this->storageState[$assetReference->assetSourceId][$assetReference->assetId][$propertyName->value][($this->dimensionHashOf)($scope)]);
            }

            public function getMetaDataPropertyValues(MetaDataAssetReference $assetReference, MetaDataPropertyName $propertyName, MetaDataDimensionSpacePoints|MetaDataGlobalScope $scope): array
            {
                $dimensionHashes = $scope instanceof MetaDataGlobalScope
                    ? ['global']
                    : $scope->map(static fn (MetaDataDimensionSpacePoint $dimensionSpacePoint) => $dimensionSpacePoint->hash);
                $propertyValues = $this->storageState[$assetReference->assetSourceId][$assetReference->assetId][$propertyName->value] ?? [];
                $result = [];
                foreach ($dimensionHashes as $dimensionHash) {
                    if (array_key_exists($dimensionHash, $propertyValues)) {
                        $result[$dimensionHash] = $propertyValues[$dimensionHash];
                    }
                }
                return $result;
            }

            public function findAssets(
                ?string $assetSourceId,
                ?string $searchTerm,
                MetaDataPropertyNames $localizedPropertyNames,
                MetaDataDimensionSpacePoints $dimensionSpacePointChain,
                MetaDataPropertyNames $globalScopePropertyNames,
            ): iterable {
                $localizedPropertyNames = $localizedPropertyNames->map(
                    static fn (MetaDataPropertyName $propertyName): string => $propertyName->value
                );
                $globalScopePropertyNames = $globalScopePropertyNames->map(
                    static fn (MetaDataPropertyName $propertyName): string => $propertyName->value
                );
                $searchTerm = $searchTerm === null ? null : strtolower($searchTerm);

                $references = [];
                foreach ($this->storageState as $storedAssetSourceId => $assetsByIdentifier) {
                    if ($assetSourceId !== null && $assetSourceId !== $storedAssetSourceId) {
                        continue;
                    }
                    foreach ($assetsByIdentifier as $assetId => $propertyValuesByName) {
                        foreach ($propertyValuesByName as $propertyName => $valuesByDimensionHash) {
                            $isGlobalScope = in_array($propertyName, $globalScopePropertyNames, true);
                            $isLocalized = !$isGlobalScope && in_array($propertyName, $localizedPropertyNames, true);
                            $candidateValues = [];
                            if ($isGlobalScope && array_key_exists('global', $valuesByDimensionHash)) {
                                $candidateValues[] = $valuesByDimensionHash['global'];
                            } elseif ($isLocalized) {
                                foreach ($dimensionSpacePointChain as $dimensionSpacePoint) {
                                    if (array_key_exists($dimensionSpacePoint->hash, $valuesByDimensionHash)) {
                                        $candidateValues[] = $valuesByDimensionHash[$dimensionSpacePoint->hash];
                                    }
                                }
                            }
                            foreach ($candidateValues as $candidateValue) {
                                if ($searchTerm === null
                                    || str_contains(strtolower((string)$candidateValue), $searchTerm)
                                ) {
                                    $references[] = MetaDataAssetReference::create($storedAssetSourceId, $assetId);
                                    break 3;
                                }
                            }
                        }
                    }
                }
                return $references;
            }
        };

        $emptyDimensionSpacePoint = MetaDataDimensionSpacePoint::fromCoordinates([]);
        $dimensionSpacePointProvider = new readonly class($emptyDimensionSpacePoint) implements DimensionSpacePointProvider {
            public function __construct(private readonly MetaDataDimensionSpacePoint $defaultDimensionSpacePoint)
            {
            }

            public function getDimensionSpacePoints(): MetaDataDimensionSpacePoints
            {
                return MetaDataDimensionSpacePoints::create($this->defaultDimensionSpacePoint);
            }

            public function getDefaultDimensionSpacePoint(): MetaDataDimensionSpacePoint
            {
                return $this->defaultDimensionSpacePoint;
            }

            public function getDimensionSpacePointChain(MetaDataDimensionSpacePoint $dimensionSpacePoint): MetaDataDimensionSpacePoints
            {
                return MetaDataDimensionSpacePoints::create($dimensionSpacePoint);
            }

            public function isDimensionSpacePointValid(MetaDataDimensionSpacePoint $dimensionSpacePoint): bool
            {
                return true;
            }
        };

        /** @var MetaDataConfigurationProviderYamlAdapter $configurationProvider */
        $configurationProvider = $this->objectManager->get(MetaDataConfigurationProviderYamlAdapter::class);
        $factory = new MetaDataManagerFactory(
            $storage,
            $dimensionSpacePointProvider,
            $configurationProvider,
        );
        $this->objectManager->setInstance(MetaDataManagerFactory::class, $factory);

        return $factory->create();
    }

    protected function tearDown(): void
    {
        $persistenceManager = self::$bootstrap->getObjectManager()->get(PersistenceManagerInterface::class);
        if (is_callable([$persistenceManager, 'tearDown'])) {
            $persistenceManager->tearDown();
        }
        self::$bootstrap->getObjectManager()->forgetInstance(PersistenceManagerInterface::class);
        self::$bootstrap->getObjectManager()->forgetInstance(MetaDataManagerFactory::class);
        parent::tearDown();
    }

    /**
     * Creates an Image object from a file using a mock resource (in order to avoid a database resource pointer entry)
     */
    protected function getMockResourceByImagePath(string $imagePathAndFilename): PersistentResource
    {
        $imagePathAndFilename = Files::getUnixStylePath($imagePathAndFilename);
        $hash = sha1_file($imagePathAndFilename);
        self::assertIsString($hash);
        copy($imagePathAndFilename, 'resource://' . $hash);
        return $this->createMockResourceAndPointerFromHash($hash);
    }

    /**
     * Creates a mock ResourcePointer and PersistentResource from a given hash.
     * Make sure that a file representation already exists, e.g. with
     * file_put_content('resource://' . $hash) before
     */
    protected function createMockResourceAndPointerFromHash(string $hash): PersistentResource
    {
        $mockResource = $this->getMockBuilder(PersistentResource::class)->addMethods(['getHash', 'getUri'])->getMock();
        $mockResource
                ->method('getHash')
                ->willReturn($hash);
        $mockResource
            ->method('getUri')
            ->willReturn('resource://' . $hash);
        return $mockResource;
    }

    /**
     * Builds a temporary directory to work on.
     */
    protected function prepareTemporaryDirectory(): void
    {
        $this->temporaryDirectory = Files::concatenatePaths([FLOW_PATH_DATA, 'Temporary', 'Testing', str_replace('\\', '_', __CLASS__)]);
        if (!file_exists($this->temporaryDirectory)) {
            Files::createDirectoryRecursively($this->temporaryDirectory);
        }
    }

    /**
     * Initializes the resource manager and modifies the persistent resource storage location.
     */
    protected function prepareResourceManager(): void
    {
        $this->resourceManager = $this->getObject(ResourceManager::class);
    }

    protected static function createFile(): Types\UploadedFile
    {
        $fileContent = Files::getFileContents(__DIR__ . '/Fixtures/norman.svg');
        return instantiate(Types\UploadedFile::class, [
            'streamOrFile' => $fileContent,
            'size' => strlen($fileContent),
            'clientMediaType' => 'image/svg+xml',
            'clientFilename' => 'test.svg',
            'errorStatus' => 0,
        ]);
    }

    /**
     * @template T of object
     * @param class-string<T> $className
     * @return T
     */
    public function getObject(string $className): object
    {
        /** @var T $object */
        $object = $this->objectManager->get($className);
        return $object;
    }
}
