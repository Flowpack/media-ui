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

    public function tearDown(): void
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
        $mockResource = $this->getMockBuilder(PersistentResource::class)->setMethods(['getHash', 'getUri'])->getMock();
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
        $this->resourceManager = $this->objectManager->get(ResourceManager::class);
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

    public function getObject(string $className): object
    {
        return $this->objectManager->get($className);
    }
}
