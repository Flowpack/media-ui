<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\Tests\Functional\Domain\Model;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Flowpack\Media\Ui\Domain\Model\HierarchicalAssetCollectionInterface;
use Flowpack\Media\Ui\Service\AssetCollectionService;
use Flowpack\Media\Ui\Tests\Functional\AbstractMediaTestCase;
use Neos\Flow\Persistence\Doctrine\PersistenceManager;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Repository\AssetCollectionRepository;

class AssetCollectionTest extends AbstractMediaTestCase
{
    /**
     * @var boolean
     */
    protected static $testablePersistenceEnabled = true;

    /**
     * @var AssetCollectionRepository
     */
    protected $assetCollectionRepository;

    /**
     * @var AssetCollectionService
     */
    protected $assetCollectionService;

    public function setUp(): void
    {
        parent::setUp();
        if (!$this->persistenceManager instanceof PersistenceManager) {
            static::markTestSkipped('Doctrine persistence is not enabled');
        }

        $this->assetCollectionRepository = $this->objectManager->get(AssetCollectionRepository::class);
        $this->assetCollectionService = $this->objectManager->get(AssetCollectionService::class);
    }

    /**
     * @test
     */
    public function parentChildrenRelation(): void
    {
        /** @var HierarchicalAssetCollectionInterface $child1 */
        $child1 = new AssetCollection('child1');
        /** @var HierarchicalAssetCollectionInterface $child2 */
        $child2 = new AssetCollection('child2');
        /** @var HierarchicalAssetCollectionInterface $parent */
        $parent = new AssetCollection('parent');

        $child1->setParent($parent);
        $child2->setParent($parent);

        $this->assetCollectionRepository->add($parent);
        $this->assetCollectionRepository->add($child1);
        $this->assetCollectionRepository->add($child2);

        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        $persistedChild = $this->assetCollectionRepository->findOneByTitle('child1');
        $persistedParent = $persistedChild->getParent();

        self::assertEquals('parent', $persistedParent->getTitle());
        self::assertNull($persistedParent->getParent());

        $children = $this->assetCollectionRepository->findByParent($parent);
        self::assertEquals(2, $children->count());
        self::assertEquals('child1', $children->offsetGet(0)->getTitle());
        self::assertEquals('child2', $children->offsetGet(1)->getTitle());
    }

    /**
     * Verifies the following hierarchie throws an error:
     *   first -> second -> third -> first
     *
     * @test
     */
    public function circularParentChildrenRelationThrowsErrorWhenSettingParent(): void
    {
        /** @var HierarchicalAssetCollectionInterface $firstCollection */
        $firstCollection = new AssetCollection('first');
        /** @var HierarchicalAssetCollectionInterface $secondCollection */
        $secondCollection = new AssetCollection('second');
        /** @var HierarchicalAssetCollectionInterface $thirdCollection */
        $thirdCollection = new AssetCollection('third');

        $secondCollection->setParent($firstCollection);
        $thirdCollection->setParent($secondCollection);

        $this->expectException(\InvalidArgumentException::class);
        $firstCollection->setParent($thirdCollection);
    }

    /**
     * @test
     */
    public function unsettingTheParentRemovesChildFromParent(): void
    {
        /** @var HierarchicalAssetCollectionInterface $child */
        $child = new AssetCollection('child');
        /** @var HierarchicalAssetCollectionInterface $parent */
        $parent = new AssetCollection('parent');

        $child->setParent($parent);

        $this->assetCollectionRepository->add($parent);
        $this->assetCollectionRepository->add($child);

        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        /** @var HierarchicalAssetCollectionInterface $persistedChild */
        $persistedChild = $this->assetCollectionRepository->findOneByTitle('child');
        $persistedChild->setParent(null);

        $this->assetCollectionRepository->update($persistedChild);
        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        $persistedChild = $this->assetCollectionRepository->findOneByTitle('child');
        $persistedParent = $this->assetCollectionRepository->findOneByTitle('parent');

        $children = $this->assetCollectionRepository->findByParent($persistedParent);

        self::assertNull($persistedChild->getParent());
        self::assertCount(0, $children);
    }

    /**
     * @test
     */
    public function deletingTheParentDeletesTheChild(): void
    {
        /** @var HierarchicalAssetCollectionInterface $child */
        $child = new AssetCollection('child');
        /** @var HierarchicalAssetCollectionInterface $parent */
        $parent = new AssetCollection('parent');

        $child->setParent($parent);

        $this->assetCollectionRepository->add($parent);
        $this->assetCollectionRepository->add($child);

        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        $persistedParent = $this->assetCollectionRepository->findOneByTitle('parent');
        $this->assetCollectionRepository->remove($persistedParent);

        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        $persistedChild = $this->assetCollectionRepository->findOneByTitle('child');
        $persistedParent = $this->assetCollectionRepository->findOneByTitle('parent');

        self::assertNull($persistedChild);
        self::assertNull($persistedParent);
    }

    /**
     * @test
     */
    public function hasParentReturnsTrueIfParentIsSet(): void
    {
        /** @var HierarchicalAssetCollectionInterface $child */
        $child = new AssetCollection('child');
        /** @var HierarchicalAssetCollectionInterface $parent */
        $parent = new AssetCollection('parent');

        $child->setParent($parent);

        $this->assetCollectionRepository->add($parent);
        $this->assetCollectionRepository->add($child);

        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        $persistedChild = $this->assetCollectionRepository->findOneByTitle('child');
        $persistedParent = $this->assetCollectionRepository->findOneByTitle('parent');

        self::assertTrue($persistedChild->hasParent());
        self::assertFalse($persistedParent->hasParent());
    }

    /**
     * @test
     */
    public function newCollectionHasPathBasedOnTitle(): void
    {
        $collection = new AssetCollection('My Collection');
        $this->assetCollectionRepository->add($collection);
        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        $persistedCollection = $this->assetCollectionRepository->findOneByTitle('My Collection');
        self::assertEquals('/my-collection', $persistedCollection->getPath());
    }

    /**
     * @test
     */
    public function updatingTitleUpdatesPathOfCollection(): void
    {
        $collection = new AssetCollection('My Collection');
        $this->assetCollectionRepository->add($collection);
        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        $persistedCollection = $this->assetCollectionRepository->findOneByTitle('My Collection');
        $persistedCollection->setTitle('New Title');
        $this->assetCollectionRepository->update($persistedCollection);
        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        $persistedCollection = $this->assetCollectionRepository->findOneByTitle('New Title');
        self::assertEquals('/new-title', $persistedCollection->getPath());
    }

    /**
     * @test
     */
    public function pathOfSubCollectionContainsPathOfParentCollection(): void
    {
        /** @var HierarchicalAssetCollectionInterface $parent */
        $parent = new AssetCollection('Parent');
        /** @var HierarchicalAssetCollectionInterface $child */
        $child = new AssetCollection('Child');
        $child->setParent($parent);

        $this->assetCollectionRepository->add($parent);
        $this->assetCollectionRepository->add($child);
        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        $persistedParent = $this->assetCollectionRepository->findOneByTitle('Parent');
        $persistedChild = $this->assetCollectionRepository->findOneByTitle('Child');

        self::assertEquals('/parent', $persistedParent->getPath());
        self::assertEquals('/parent/child', $persistedChild->getPath());
    }

    /**
     * @test
     */
    public function pathOfSubCollectionUpdatesWhenParentIsRenamed(): void
    {
        /** @var HierarchicalAssetCollectionInterface $parent */
        $parent = new AssetCollection('Parent');
        /** @var HierarchicalAssetCollectionInterface $child */
        $child = new AssetCollection('Child');
        $child->setParent($parent);

        $this->assetCollectionRepository->add($parent);
        $this->assetCollectionRepository->add($child);
        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        $persistedParent = $this->assetCollectionRepository->findOneByTitle('Parent');

        $persistedParent->setTitle('New Parent Title');
        $this->assetCollectionService->updatePathForNestedAssetCollections($persistedParent);

        $this->assetCollectionRepository->update($persistedParent);
        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        $persistedParent = $this->assetCollectionRepository->findOneByTitle('New Parent Title');
        $persistedChild = $this->assetCollectionRepository->findOneByTitle('Child');

        self::assertEquals('/new-parent-title', $persistedParent->getPath());
        self::assertEquals('/new-parent-title/child', $persistedChild->getPath());
    }
}
