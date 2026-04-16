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
    }

    public function testCreateAssetCollection(): void
    {
        $assetCollection = $this->mediaApi->createAssetCollection(
            Types\AssetCollectionTitle::fromString('Test Collection'),
            Types\AssetSourceId::default(),
        );
        $this->assertInstanceOf(Types\AssetCollection::class, $assetCollection);
        $this->assertEquals('Test Collection', $assetCollection->title->value);

        $childCollection = $this->mediaApi->createAssetCollection(
            Types\AssetCollectionTitle::fromString('Child Collection'),
            Types\AssetSourceId::default(),
            $assetCollection->id,
        );

        $this->assertInstanceOf(Types\AssetCollection::class, $childCollection);
        $this->assertTrue(str_starts_with($childCollection->path->value, $assetCollection->path->value));
    }

    public function testDeleteAssetCollection(): void
    {
        $assetCollection = $this->mediaApi->createAssetCollection(
            Types\AssetCollectionTitle::fromString('Test Collection'),
            Types\AssetSourceId::default(),
        );
        $result = $this->mediaApi->deleteAssetCollection($assetCollection->id, Types\AssetSourceId::default());

        $this->assertTrue($result->success);

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

        $result = $this->mediaApi->setAssetCollectionParent(
            $childCollection->id,
            Types\AssetSourceId::default(),
            $parentCollection->id,
        );
        $this->assertTrue($result->success);

        $updatedChildCollection = $this->mediaApi->assetCollection($childCollection->id, Types\AssetSourceId::default(),);
        $this->assertTrue(str_starts_with($updatedChildCollection->path->value, $parentCollection->path->value));

        $this->mediaApi->setAssetCollectionParent(
            $childCollection->id,
            Types\AssetSourceId::default(),
        );

        $updatedChildCollection = $this->mediaApi->assetCollection($childCollection->id, Types\AssetSourceId::default(),);
        $this->assertEquals($childCollection->path->value, $updatedChildCollection->path->value);
    }
}
