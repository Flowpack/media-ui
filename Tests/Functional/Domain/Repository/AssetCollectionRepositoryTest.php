<?php
declare(strict_types=1);

namespace Flowpack\Media\Ui\Tests\Functional\Domain\Repository;

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
use Flowpack\Media\Ui\Tests\Functional\AbstractMediaTestCase;
use Neos\Flow\Persistence\Doctrine\PersistenceManager;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Repository\AssetCollectionRepository;

/**
 * Testcase for an asset collection repository
 *
 */
class AssetCollectionRepositoryTest extends AbstractMediaTestCase
{
    /**
     * @var boolean
     */
    protected static $testablePersistenceEnabled = true;

    protected AssetCollectionRepository $assetCollectionRepository;

    public function setUp(): void
    {
        parent::setUp();
        if (!$this->persistenceManager instanceof PersistenceManager) {
            static::markTestSkipped('Doctrine persistence is not enabled');
        }

        $this->assetCollectionRepository = $this->objectManager->get(AssetCollectionRepository::class);
    }

    /**
     * @test
     */
    public function parentRemoveRemovesCompleteHierarchy(): void
    {
        /** @var HierarchicalAssetCollectionInterface $grandchild */
        $grandchild = new AssetCollection('grandChild');
        /** @var HierarchicalAssetCollectionInterface $child */
        $child = new AssetCollection('child');
        /** @var HierarchicalAssetCollectionInterface $parent */
        $parent = new AssetCollection('parent');
        $child->setParent($parent);
        $grandchild->setParent($child);

        $this->assetCollectionRepository->add($parent);
        $this->assetCollectionRepository->add($child);
        $this->assetCollectionRepository->add($grandchild);

        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        $persistedParent = $this->assetCollectionRepository->findOneByTitle('parent');
        $this->assetCollectionRepository->remove($persistedParent);
        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        static::assertNull($this->assetCollectionRepository->findOneByTitle('child'));
        static::assertNull($this->assetCollectionRepository->findOneByTitle('grandChild'));
        static::assertNull($this->assetCollectionRepository->findOneByTitle('parent'));
    }
}
