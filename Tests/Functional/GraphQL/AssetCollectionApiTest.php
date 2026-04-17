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
use Flowpack\Media\Ui\GraphQL\Types;
use Flowpack\Media\Ui\Tests\Functional\AbstractMediaTestCase;
use Neos\Flow\Persistence\Doctrine\PersistenceManager;
use PHPUnit\Framework\Assert;

/**
 * Testcase for the Media.Ui API
 */
class AssetCollectionApiTest extends AbstractMediaTestCase
{
    /**
     * @var boolean
     */
    protected static $testablePersistenceEnabled = true;

    protected MediaApi $mediaApi;

    public function setUp(): void
    {
        parent::setUp();
        if (!$this->persistenceManager instanceof PersistenceManager) {
            static::markTestSkipped('Doctrine persistence is not enabled');
        }

        $this->mediaApi = $this->objectManager->get(MediaApi::class);

        $this->authenticateRoles(['Neos.Neos:Editor']);
    }

    public function testCreateAssetCollection(): void
    {
        $assetCollection = $this->mediaApi->createAssetCollection(
            Types\AssetCollectionTitle::fromString('Test Collection'),
            Types\AssetSourceId::default(),
        );
        Assert::assertNotNull($assetCollection->path);
        $this->assertEquals('Test Collection', $assetCollection->title->value);

        $childCollection = $this->mediaApi->createAssetCollection(
            Types\AssetCollectionTitle::fromString('Child Collection'),
            Types\AssetSourceId::default(),
            $assetCollection->id,
        );

        Assert::assertNotNull($childCollection->path);
        $this->assertTrue(str_starts_with($childCollection->path->value, $assetCollection->path->value));

        $this->persist();

        $assetCollections = $this->mediaApi->assetCollections(Types\AssetSourceId::default());
        $this->assertNotEmpty($assetCollections->collections);

        // Assert that the created asset collection is in the list of asset collections
        $foundCollection = false;
        foreach ($assetCollections->collections as $collection) {
            if ($collection->equals($assetCollection)) {
                $foundCollection = true;
                break;
            }
        }
        $this->assertTrue($foundCollection, 'The created asset collection was not found in the list of asset collections.');
    }

    public function testDeleteAssetCollection(): void
    {
        $assetCollection = $this->mediaApi->createAssetCollection(
            Types\AssetCollectionTitle::fromString('Test Collection'),
            Types\AssetSourceId::default(),
        );
        $result = $this->mediaApi->deleteAssetCollection($assetCollection->id, Types\AssetSourceId::default());

        $this->assertTrue($result->success);

        $this->persist();

        $assetCollection = $this->mediaApi->assetCollection($assetCollection->id, Types\AssetSourceId::default());
        $this->assertNull($assetCollection);
    }

    public function testDeleteNonExistingAssetCollection(): void
    {
        $result = $this->mediaApi->deleteAssetCollection(
            Types\AssetCollectionId::fromString('non-existing-id'),
            Types\AssetSourceId::default(),
        );

        $this->assertFalse($result->success);
    }

    public function testUpdateAssetCollection(): void
    {
        $assetCollection = $this->mediaApi->createAssetCollection(
            Types\AssetCollectionTitle::fromString('Test Collection'),
            Types\AssetSourceId::default(),
        );
        $result = $this->mediaApi->updateAssetCollection(
            $assetCollection->id,
            Types\AssetSourceId::default(),
            Types\AssetCollectionTitle::fromString('Updated Collection'),
        );

        $this->assertTrue($result->success);

        $updatedAssetCollection = $this->mediaApi->assetCollection(
            $assetCollection->id,
            Types\AssetSourceId::default()
        );
        Assert::assertNotNull($updatedAssetCollection);

        $this->assertEquals('Updated Collection', $updatedAssetCollection->title->value);
    }

    public function testSetAssetCollectionParent(): void
    {
        $parentCollection = $this->mediaApi->createAssetCollection(
            Types\AssetCollectionTitle::fromString('Parent Collection'),
            Types\AssetSourceId::default(),
        );
        $childCollection = $this->mediaApi->createAssetCollection(
            Types\AssetCollectionTitle::fromString('Child Collection'),
            Types\AssetSourceId::default(),
        );
        Assert::assertNotNull($childCollection->path);

        $result = $this->mediaApi->setAssetCollectionParent(
            $childCollection->id,
            Types\AssetSourceId::default(),
            $parentCollection->id,
        );
        $this->assertTrue($result->success);
        Assert::assertNotNull($parentCollection->path);

        $updatedChildCollection = $this->mediaApi->assetCollection($childCollection->id, Types\AssetSourceId::default());
        Assert::assertNotNull($updatedChildCollection);
        Assert::assertNotNull($updatedChildCollection->path);
        $this->assertTrue(str_starts_with($updatedChildCollection->path->value, $parentCollection->path->value));

        $this->mediaApi->setAssetCollectionParent(
            $childCollection->id,
            Types\AssetSourceId::default(),
        );

        $updatedChildCollection = $this->mediaApi->assetCollection($childCollection->id, Types\AssetSourceId::default());
        Assert::assertNotNull($updatedChildCollection);
        Assert::assertNotNull($updatedChildCollection->path);
        $this->assertEquals(
            $childCollection->path->value,
            $updatedChildCollection->path->value,
        );
    }
}
