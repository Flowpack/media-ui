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

use Doctrine\DBAL\Platforms\AbstractMySQLPlatform;
use Doctrine\ORM\EntityManagerInterface;
use Flowpack\Media\Ui\GraphQL\Types;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Flow\ResourceManagement\PersistentResource;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Flow\Tests\FunctionalTestCase;
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
     * @var ResourceManager
     */
    protected $resourceManager;

    /**
     * @inheritDoc
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->createMetaDataValueTable();
    }

    /**
     * Creates the table the MetaDataManager writes to.
     *
     * The table is not mapped as an entity, so the functional test schema, which is derived from entity
     * metadata only, does not contain it. As with the MetaData storage adapter tests, the foreign key of
     * the Doctrine migration is omitted on purpose - the migration cannot be run here.
     *
     * TODO: This should be solved in a better way in the metadata package so we can either mock the metadatamanager or can rely on the tables to exist
     *
     * @see \Neos\Flow\Persistence\Doctrine\Migrations\Version20260415145934
     */
    protected function createMetaDataValueTable(): void
    {
        /** @var EntityManagerInterface $entityManager */
        $entityManager = $this->objectManager->get(EntityManagerInterface::class);
        $connection = $entityManager->getConnection();
        if (!$connection->getDatabasePlatform() instanceof AbstractMySQLPlatform) {
            $this->markTestSkipped('The metadata storage adapter requires MySQL or MariaDB');
        }
        $connection->executeStatement('CREATE TABLE IF NOT EXISTS neos_metadata_value (
            `asset_source_id` VARCHAR(255) DEFAULT NULL,
            `asset_id` VARCHAR(40) DEFAULT NULL,
            `property_name` VARCHAR(40) NOT NULL,
            `property_value` TEXT NOT NULL,
            `dimension_hash` VARCHAR(250) NOT NULL,
            UNIQUE INDEX idx_unique (`asset_source_id`, `asset_id`, `property_name`, `dimension_hash`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    protected function tearDown(): void
    {
        $persistenceManager = self::$bootstrap->getObjectManager()->get(PersistenceManagerInterface::class);
        if (is_callable([$persistenceManager, 'tearDown'])) {
            $persistenceManager->tearDown();
        }
        self::$bootstrap->getObjectManager()->forgetInstance(PersistenceManagerInterface::class);
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
