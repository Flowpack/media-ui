<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Tests\Functional\Domain\Model\AssetSource;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Doctrine\DBAL\Platforms\AbstractMySQLPlatform;
use Doctrine\ORM\EntityManagerInterface;
use Flowpack\Media\Ui\Domain\Model\AssetSource\NeosAssetProxyRepository;
use Flowpack\Media\Ui\Tests\Functional\AbstractMediaTestCase;
use Neos\Flow\Persistence\Doctrine\PersistenceManager;
use Neos\Media\Domain\Model\AssetSource\AssetTypeFilter;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetNotFoundException;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetSource;
use Neos\Media\Domain\Model\Image;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Domain\Repository\TagRepository;
use Neos\MetaData\Domain\Dto\MetaDataAssetReference;
use Neos\MetaData\MetaDataManager;
use Neos\Utility\Files;

class NeosAssetProxyRepositoryTest extends AbstractMediaTestCase
{
    /**
     * @var bool
     */
    protected static $testablePersistenceEnabled = true;

    protected AssetRepository $assetRepository;
    protected TagRepository $tagRepository;

    protected function setUp(): void
    {
        parent::setUp();
        if (!$this->persistenceManager instanceof PersistenceManager) {
            static::markTestSkipped('Doctrine persistence is not enabled');
        }

        $this->prepareResourceManager();
        $this->assetRepository = $this->objectManager->get(AssetRepository::class);
        $this->tagRepository = $this->objectManager->get(TagRepository::class);
    }

    private function createImage(string $title): Image
    {
        $resource = $this->resourceManager->importResource(
            Files::getUnixStylePath(__DIR__ . '/../../../Fixtures/evil-norman.jpg')
        );
        $image = new Image($resource);
        $image->setTitle($title);
        $this->assetRepository->add($image);
        return $image;
    }

    private function createRepository(): NeosAssetProxyRepository
    {
        return new NeosAssetProxyRepository(new NeosAssetSource('neos', []));
    }

    /**
     * @test
     */
    public function getAssetProxyReturnsProxyForExistingAsset(): void
    {
        $image = $this->createImage('First Image');
        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        $proxy = $this->createRepository()->getAssetProxy($this->persistenceManager->getIdentifierByObject($image));
        static::assertSame($this->persistenceManager->getIdentifierByObject($image), $proxy->getLocalAssetIdentifier());
    }

    /**
     * @test
     */
    public function getAssetProxyThrowsForMissingAsset(): void
    {
        $this->expectException(NeosAssetNotFoundException::class);
        $this->createRepository()->getAssetProxy('00000000-0000-0000-0000-000000000000');
    }

    /**
     * @test
     */
    public function findAllQuerySupportsOffsetAndLimit(): void
    {
        $this->createImage('First Image');
        $this->createImage('Second Image');
        $this->createImage('Third Image');
        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        $query = $this->createRepository()->findAll()->getQuery();

        static::assertSame(3, $query->count());

        $query->setOffset(1);
        $query->setLimit(1);
        $result = $query->execute();

        static::assertCount(1, $result);
    }

    /**
     * @test
     */
    public function countAllReflectsFilterByType(): void
    {
        $this->createImage('First Image');
        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        $repository = $this->createRepository();
        $repository->filterByType(new AssetTypeFilter('Image'));
        static::assertSame(1, $repository->countAll());
    }

    /**
     * Requires the optional Neos.MetaData package, therefore tagged "metadata-capabilities" and
     * excluded from the default functional test run (see CI).
     *
     * @test
     * @group metadata-capabilities
     */
    public function findBySearchTermUsesMetaData(): void
    {
        if (!$this->usesMySql()) {
            static::markTestSkipped('MetaData-driven search requires a MySQL database (MetaData storage uses MySQL-specific SQL).');
        }
        $this->createMetaDataTableIfNecessary();

        $image = $this->createImage('First Image');
        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        $identifier = $this->persistenceManager->getIdentifierByObject($image);
        $metaDataManager = $this->objectManager->get(MetaDataManager::class);
        $metaDataManager->setMetaDataPropertyValue(
            MetaDataAssetReference::create('neos', $identifier),
            'copyright',
            'AnotherUniqueToken'
        );

        $result = $this->createRepository()->findBySearchTerm('AnotherUniqueToken');
        static::assertCount(1, $result);
        static::assertSame($identifier, $result->getFirst()->getLocalAssetIdentifier());
    }

    /**
     * @test
     */
    public function findByTagAndCountByTagDelegateToQuery(): void
    {
        $image = $this->createImage('First Image');
        $tag = new Tag('RepoTag');
        $this->tagRepository->add($tag);
        $image->addTag($tag);
        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        $persistedTag = $this->tagRepository->findOneByLabel('RepoTag');
        $repository = $this->createRepository();

        static::assertCount(1, $repository->findByTag($persistedTag));
        static::assertSame(1, $repository->countByTag($persistedTag));
    }

    private function usesMySql(): bool
    {
        $platform = $this->objectManager->get(EntityManagerInterface::class)
            ->getConnection()->getDatabasePlatform();
        return $platform instanceof AbstractMySQLPlatform;
    }

    private function createMetaDataTableIfNecessary(): void
    {
        $this->objectManager->get(EntityManagerInterface::class)->getConnection()->executeStatement('CREATE TABLE IF NOT EXISTS neos_metadata_value (
            `asset_source_id` VARCHAR(255) DEFAULT NULL,
            `asset_id` VARCHAR(40) DEFAULT NULL,
            `property_name` VARCHAR(40) NOT NULL,
            `property_value` VARCHAR(250) NOT NULL,
            `dimension_hash` VARCHAR(250) NOT NULL,
            UNIQUE INDEX idx_unique (`asset_source_id`, `asset_id`, `property_name`, `dimension_hash`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }
}
