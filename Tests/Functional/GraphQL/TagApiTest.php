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
use Flowpack\Media\Ui\GraphQL\Resolver\Type\AssetCollectionResolver;
use Flowpack\Media\Ui\GraphQL\Types;
use Flowpack\Media\Ui\Tests\Functional\AbstractMediaTestCase;
use Neos\Flow\Persistence\Doctrine\PersistenceManager;

/**
 * Testcase for the Media.Ui API
 */
class TagApiTest extends AbstractMediaTestCase
{
    /**
     * @var boolean
     */
    protected static $testablePersistenceEnabled = true;

    public function setUp(): void
    {
        parent::setUp();
        if (!$this->persistenceManager instanceof PersistenceManager) {
            static::markTestSkipped('Doctrine persistence is not enabled');
        }

        $this->mediaApi = $this->objectManager->get(MediaApi::class);
        $this->assetCollectionResolver = $this->objectManager->get(AssetCollectionResolver::class);
    }

    public function testCreateTag(): void
    {
        $tag = $this->mediaApi->createTag(Types\TagLabel::fromString('Test Tag'));
        $this->assertEquals('Test Tag', $tag->label);
    }

    public function testUpdateTag(): void
    {
        $tag = $this->mediaApi->createTag(Types\TagLabel::fromString('Test Tag'));
        $updatedTag = $this->mediaApi->updateTag($tag->id, Types\TagLabel::fromString('Updated Tag'));

        $this->assertEquals('Updated Tag', $updatedTag->label);
    }

    public function testDeleteTag(): void
    {
        $tag = $this->mediaApi->createTag(Types\TagLabel::fromString('Test Tag'));
        $result = $this->mediaApi->deleteTag($tag->id);

        $this->assertTrue($result->success);

        $deletedTag = $this->mediaApi->tag($tag->id);
        $this->assertNull($deletedTag);
    }

    public function testTagAssetCollection(): void
    {
        $assetCollection = $this->mediaApi->createAssetCollection(
            Types\AssetCollectionTitle::fromString('Test Collection')
        );
        $tag = $this->mediaApi->createTag(Types\TagLabel::fromString('Test Tag'), $assetCollection->id);
        $createdTag = $this->mediaApi->tag($tag->id);

        $resolvedTags = $this->assetCollectionResolver->tags($assetCollection);
        $this->assertCount(1, $resolvedTags->tags);
        $this->assertEquals(
            $createdTag,
            $resolvedTags->tags[0],
            'The tag should be associated with the asset collection'
        );
    }
}
