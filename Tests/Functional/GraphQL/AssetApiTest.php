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

use Flowpack\Media\Ui\GraphQL\MediaApi;
use Flowpack\Media\Ui\GraphQL\Resolver\Type\AssetResolver;
use Flowpack\Media\Ui\GraphQL\Types;
use Flowpack\Media\Ui\Tests\Functional\AbstractMediaTestCase;
use Flowpack\Media\Ui\Tests\Functional\TestAssetUsageStrategy;
use Neos\Flow\Persistence\Doctrine\PersistenceManager;
use Neos\Flow\Tests\Behavior\Features\Bootstrap\SecurityOperationsTrait;
use Neos\Media\Domain\Repository\AssetRepository;

use function Wwwision\Types\instantiate;

/**
 * Testcase for the Media.Ui API
 */
class AssetApiTest extends AbstractMediaTestCase
{
    use SecurityOperationsTrait;

    /**
     * @var boolean
     */
    protected static $testablePersistenceEnabled = true;

    protected MediaApi $mediaApi;
    protected AssetResolver $assetResolver;
    protected TestAssetUsageStrategy $testAssetUsageStrategy;
    protected AssetRepository $assetRepository;

    public function setUp(): void
    {
        parent::setUp();
        $this->isolated = false;
        if (!$this->persistenceManager instanceof PersistenceManager) {
            static::markTestSkipped('Doctrine persistence is not enabled');
        }

        $this->mediaApi = $this->objectManager->get(MediaApi::class);
        $this->assetResolver = $this->objectManager->get(AssetResolver::class);
        $this->testAssetUsageStrategy = $this->objectManager->get(TestAssetUsageStrategy::class);
        $this->assetRepository = $this->objectManager->get(AssetRepository::class);

        // Reset the test strategy before each test
        $this->testAssetUsageStrategy->reset();

        $this->iAmAuthenticatedWithRole('Neos.Neos:Editor');
    }

    public function testUploadFile(): void
    {
        $file = self::createFile();
        $result = $this->mediaApi->uploadFile($file);

        $this->assertTrue($result->success);
        $this->assertEquals('test.svg', $result->filename->value);
    }

    public function testUploadFiles(): void
    {
        $file = self::createFile();
        $result = $this->mediaApi->uploadFiles(
            Types\UploadedFiles::fromArray([$file])
        );

        $this->assertCount(1, $result->values);
        $uploadResult = $result->getIterator()->current();
        $this->assertInstanceOf(Types\FileUploadResult::class, $uploadResult);
        $this->assertTrue($uploadResult->success);
        $this->assertEquals('test.svg', $uploadResult->filename->value);
    }

    public function testEditAsset(): void
    {
        $file = self::createFile();
        $result = $this->mediaApi->uploadFiles(
            Types\UploadedFiles::fromArray([$file])
        );
        $this->assertCount(1, $result->values);

        $this->persistenceManager->persistAll();

        $asset = $this->mediaApi->assets()->assets[0];
        $this->assertEquals($file->clientFilename, $asset->filename->value);

        // Edit the asset
        $editResult = $this->mediaApi->editAsset(
            $asset->id,
            $asset->assetSource->id,
            Types\Filename::fromString('new-name.svg'),
            instantiate(Types\AssetEditOptions::class, [
                'generateRedirects' => false,
            ])
        );

        $this->assertTrue($editResult->success);
        $editedAsset = $this->mediaApi->assets()->assets[0];
        $this->assertEquals('new-name.svg', $editedAsset->filename->value);
    }

    public function testDeleteUnusedAssetWorks(): void
    {
        $file = self::createFile();
        $result = $this->mediaApi->uploadFiles(Types\UploadedFiles::fromArray([$file]));
        $this->assertCount(1, $result->values);
        $this->persistenceManager->persistAll();

        $asset = $this->mediaApi->assets()->assets[0];
        $this->assertEquals($file->clientFilename, $asset->filename->value);

        // Delete the asset
        $deleteResult = $this->mediaApi->deleteAsset($asset->id, $asset->assetSource->id);
        $this->persistenceManager->persistAll();

        $this->assertTrue($deleteResult->success);
        $assetsAfterDeletion = $this->mediaApi->assets();
        $this->assertCount(0, $assetsAfterDeletion);
    }

    public function testDeleteUsedAssetFails(): void
    {
        $file = self::createFile();
        $result = $this->mediaApi->uploadFiles(Types\UploadedFiles::fromArray([$file]));
        $this->assertCount(1, $result->values);
        $this->persistenceManager->persistAll();
        $asset = $this->mediaApi->assets()->assets[0];

        // Get the actual asset entity from repository and mark it as used
        $assetEntity = $this->assetRepository->findByIdentifier($asset->id->value);
        $this->testAssetUsageStrategy->markAssetAsUsed($assetEntity);

        // Try to delete the used asset
        $deleteResult = $this->mediaApi->deleteAsset($asset->id, $asset->assetSource->id);
        $this->persistenceManager->persistAll();

        $this->assertFalse($deleteResult->success);
        $assetsAfterDeletion = $this->mediaApi->assets();
        $this->assertCount(1, $assetsAfterDeletion);
    }

    public function testUpdateAsset(): void
    {
        $file = self::createFile();
        $result = $this->mediaApi->uploadFiles(
            Types\UploadedFiles::fromArray([$file])
        );
        $this->assertCount(1, $result->values);
        $this->persistenceManager->persistAll();

        $assets = $this->mediaApi->assets();
        $asset = $assets->getIterator()->current();
        $this->assertEquals($file->clientFilename, $asset->filename->value);

        $updatedAsset = $this->mediaApi->updateAsset(
            $asset->id,
            $asset->assetSource->id,
            'some label',
            'some caption',
            'copyright notice',
        );

        $this->assertEquals($asset->id, $updatedAsset->id);
        $this->assertEquals('some label', $this->assetResolver->label($updatedAsset));
        $this->assertEquals('some caption', $this->assetResolver->caption($updatedAsset));
        $this->assertEquals('copyright notice', $this->assetResolver->copyrightNotice($updatedAsset));
    }

    public function testGetAsset(): void
    {
        $file = self::createFile();
        $result = $this->mediaApi->uploadFiles(
            Types\UploadedFiles::fromArray([$file])
        );
        $this->assertCount(1, $result->values);
        $this->persistenceManager->persistAll();

        $assets = $this->mediaApi->assets();
        $asset = $assets->getIterator()->current();
        $this->assertEquals($file->clientFilename, $asset->filename->value);

        $fetchedAsset = $this->mediaApi->asset(
            $asset->id,
            $asset->assetSource->id,
        );
        $this->assertEquals($asset->id, $fetchedAsset->id);
    }

    public function testAssetCount(): void
    {
        $assetCount = $this->mediaApi->assetCount();
        $this->assertEquals(0, $assetCount);

        $file = self::createFile();
        $result = $this->mediaApi->uploadFiles(
            Types\UploadedFiles::fromArray([$file])
        );
        $this->assertCount(1, $result->values);
        $this->persistenceManager->persistAll();

        $assetCount = $this->mediaApi->assetCount();
        $this->assertEquals(1, $assetCount);

        $unusedAssetCount = $this->mediaApi->unusedAssetCount();
        $this->assertEquals(1, $unusedAssetCount);
    }

    public function testAssetSources(): void
    {
        $assetSources = $this->mediaApi->assetSources();
        $this->assertGreaterThanOrEqual(1, count($assetSources->collections));
        $assetSource = $assetSources->getIterator()->current();
        $this->assertEquals('Neos', $assetSource->label);
    }

    public function testConfig(): void
    {
        $config = $this->mediaApi->config();
        $this->assertNotEmpty($config);
        $this->assertEquals(Types\DateTime::now(), $config->currentServerTime);
        $this->assertGreaterThan(0, $config->uploadMaxFileSize->value);
        $this->assertGreaterThan(0, $config->uploadMaxFileUploadLimit);
        $this->assertTrue($config->canManageAssets);
        $this->assertTrue($config->canManageTags);
        $this->assertTrue($config->canManageAssetCollections);
        $this->assertNull($config->defaultAssetCollectionId);
    }

    public function testAssetUsageDetails(): void
    {
        $file = self::createFile();
        $result = $this->mediaApi->uploadFiles(
            Types\UploadedFiles::fromArray([$file])
        );
        $this->assertCount(1, $result->values);
        $this->persistenceManager->persistAll();

        $assets = $this->mediaApi->assets();
        $asset = $assets->getIterator()->current();
        $usageDetails = $this->mediaApi->assetUsageDetails(
            $asset->id,
            $asset->assetSource->id,
        );
        $this->assertEmpty($usageDetails->groups);

        // TODO: Add a test for the usage details when the asset is used in a content repository
    }

    public function testAssetUsageCount(): void
    {
        $file = self::createFile();
        $result = $this->mediaApi->uploadFiles(
            Types\UploadedFiles::fromArray([$file])
        );
        $this->assertCount(1, $result->values);
        $this->persistenceManager->persistAll();

        $assets = $this->mediaApi->assets();
        $asset = $assets->getIterator()->current();
        $usageCount = $this->mediaApi->assetUsageCount(
            $asset->id,
            $asset->assetSource->id,
        );
        $this->assertEquals(0, $usageCount);

        // TODO: Add a test for the usage count when the asset is used in a content repository
    }

    /**
     * @group entity-usage
     */
    public function testUnusedAssets(): void
    {
        $file = self::createFile();
        $result = $this->mediaApi->uploadFiles(
            Types\UploadedFiles::fromArray([$file])
        );
        $this->assertCount(1, $result->values);
        $this->persistenceManager->persistAll();

        $unusedAssets = $this->mediaApi->unusedAssets(Types\AssetSourceId::default());
        $unusedAsset = $unusedAssets->getIterator()->current();
        $this->assertCount(1, $unusedAssets);
        $this->assertEquals($file->clientFilename, $unusedAsset->filename->value);
    }
}
