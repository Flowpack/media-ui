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
use Neos\Behat\FlowEntitiesTrait;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Flow\ResourceManagement\PersistentResource;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Flow\Tests\Behavior\Features\Bootstrap\SecurityOperationsTrait;
use Neos\Flow\Tests\FunctionalTestCase;
use Neos\Utility\Files;

use function Wwwision\Types\instantiate;

/**
 * Abstract Functional Test template
 */
abstract class AbstractMediaTestCase extends FunctionalTestCase
{
    use SecurityOperationsTrait;
    use FlowEntitiesTrait;

    /**
     * @var string
     */
    protected $temporaryDirectory;

    /**
     * @var ResourceManager
     */
    protected $resourceManager;

    protected function setUp(): void
    {
        $this->objectManager = self::$bootstrap->getObjectManager();

        $this->truncateAndSetupFlowEntities();

        $this->cleanupPersistentResourcesDirectory();
        self::$bootstrap->getObjectManager()->forgetInstance(ResourceManager::class);
        $session = $this->objectManager->get(\Neos\Flow\Session\SessionInterface::class);
        if ($session->isStarted()) {
            $session->destroy(
                sprintf(
                    'assure that session is fresh, in setUp() method of functional test %s.',
                    get_class($this) . '::' . $this->getName()
                )
            );
        }

        $privilegeManager = $this->objectManager->get(\Neos\Flow\Security\Authorization\TestingPrivilegeManager::class);
        $privilegeManager->reset();

        if ($this->testableSecurityEnabled === true || static::$testablePersistenceEnabled === true) {
            $this->persistenceManager = $this->objectManager->get(
                PersistenceManagerInterface::class
            );
        } else {
            $privilegeManager->setOverrideDecision(true);
        }

        // HTTP must be initialized before Session and Security because they rely
        // on an HTTP request being available via the request handler:
        $this->setupHttp();

        $session = $this->objectManager->get(\Neos\Flow\Session\SessionInterface::class);
        if ($session->isStarted()) {
            $session->destroy(
                sprintf(
                    'assure that session is fresh, in setUp() method of functional test %s.',
                    get_class($this) . '::' . $this->getName()
                )
            );
        }

        $this->setupSecurity();
    }

    protected function persist(): void
    {
        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();
    }

    public function tearDown(): void
    {
        try {
            $this->persistenceManager->persistAll();
        } catch (\Exception $exception) {
        }

        //if (is_callable([$this->persistenceManager, 'tearDown'])) {
        //    $this->persistenceManager->tearDown();
        //}
        //$persistenceManager = self::$bootstrap->getObjectManager()->get(PersistenceManagerInterface::class);
        //if (is_callable([$persistenceManager, 'tearDown'])) {
        //    $persistenceManager->tearDown();
        //}
        //self::$bootstrap->getObjectManager()->forgetInstance(PersistenceManagerInterface::class);
        //parent::tearDown();
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
        $mockResource->expects(self::any())
            ->method('getHash')
            ->will(self::returnValue($hash));
        $mockResource->expects(self::any())
            ->method('getUri')
            ->will(self::returnValue('resource://' . $hash));
        return $mockResource;
    }

    /**
     * Builds a temporary directory to work on.
     */
    protected function prepareTemporaryDirectory(): void
    {
        $this->temporaryDirectory = Files::concatenatePaths(
            [FLOW_PATH_DATA, 'Temporary', 'Testing', str_replace('\\', '_', __CLASS__)]
        );
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

    /**
     * @template T of object
     * @param class-string<T> $className
     *
     * @return T
     */
    private function getObject(string $className): object
    {
        return $this->objectManager->get($className);
    }
}
