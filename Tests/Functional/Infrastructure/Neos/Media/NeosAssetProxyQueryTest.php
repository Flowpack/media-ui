<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Tests\Functional\Infrastructure\Neos\Media;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\DBAL\Platforms\AbstractMySQLPlatform;
use Doctrine\ORM\EntityManagerInterface;
use Flowpack\Media\Ui\Infrastructure\Neos\Media\NeosAssetProxyQuery;
use Flowpack\Media\Ui\Tests\Functional\AbstractMediaTestCase;
use Neos\Flow\Persistence\Doctrine\PersistenceManager;
use Neos\Media\Domain\Model\Asset;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Model\AssetSource\Neos\NeosAssetSource;
use Neos\Media\Domain\Model\Document;
use Neos\Media\Domain\Model\Image;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Repository\AssetCollectionRepository;
use Neos\Media\Domain\Repository\AssetRepository;
use Neos\Media\Domain\Repository\TagRepository;
use Neos\MetaData\Domain\Dto\MetaDataAssetReference;
use Neos\MetaData\MetaDataManager;
use Neos\Utility\Files;

class NeosAssetProxyQueryTest extends AbstractMediaTestCase
{
    /**
     * @var bool
     */
    protected static $testablePersistenceEnabled = true;

    protected AssetRepository $assetRepository;
    protected TagRepository $tagRepository;
    protected AssetCollectionRepository $assetCollectionRepository;
    protected EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        parent::setUp();
        if (!$this->persistenceManager instanceof PersistenceManager) {
            static::markTestSkipped('Doctrine persistence is not enabled');
        }

        $this->prepareResourceManager();
        $this->assetRepository = $this->objectManager->get(AssetRepository::class);
        $this->tagRepository = $this->objectManager->get(TagRepository::class);
        $this->assetCollectionRepository = $this->objectManager->get(AssetCollectionRepository::class);
        $this->entityManager = $this->objectManager->get(EntityManagerInterface::class);
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

    private function createDocument(string $title): Document
    {
        $resource = $this->resourceManager->importResource(
            Files::getUnixStylePath(__DIR__ . '/../../../Fixtures/example.txt')
        );
        $document = new Document($resource);
        $document->setTitle($title);
        $this->assetRepository->add($document);
        return $document;
    }

    private function createQuery(): NeosAssetProxyQuery
    {
        return new NeosAssetProxyQuery(
            $this->objectManager,
            $this->entityManager,
            new NeosAssetSource('neos', [])
        );
    }

    /**
     * @return string[]
     */
    private function identifiersOf(iterable $proxies): array
    {
        $identifiers = [];
        foreach ($proxies as $proxy) {
            $identifiers[] = $proxy->getLocalAssetIdentifier();
        }
        return $identifiers;
    }

    private function persistFixtures(): Asset
    {
        $firstImage = $this->createImage('First Image');
        $this->createImage('Second Image');
        $this->createDocument('A Document');

        $tag = new Tag('DemoTag');
        $this->tagRepository->add($tag);
        $firstImage->addTag($tag);

        $collection = new AssetCollection('DemoCollection');
        $this->assetCollectionRepository->add($collection);
        $firstImage->setAssetCollections(new ArrayCollection([$collection]));

        $this->persistenceManager->persistAll();
        $this->persistenceManager->clearState();

        return $this->assetRepository->findByIdentifier($this->persistenceManager->getIdentifierByObject($firstImage));
    }

    /**
     * @test
     */
    public function findAllReturnsAllPersistedAssets(): void
    {
        $firstImage = $this->persistFixtures();
        $expected = [
            $this->persistenceManager->getIdentifierByObject($firstImage),
            $this->persistenceManager->getIdentifierByObject($this->assetRepository->findOneByTitle('Second Image')),
            $this->persistenceManager->getIdentifierByObject($this->assetRepository->findOneByTitle('A Document')),
        ];

        $query = $this->createQuery();
        $identifiers = $this->identifiersOf($query->findAll());

        foreach ($expected as $identifier) {
            static::assertContains($identifier, $identifiers);
        }
    }

    /**
     * @test
     */
    public function countAllReflectsPersistedAssets(): void
    {
        $firstImage = $this->persistFixtures();
        $document = $this->assetRepository->findOneByTitle('A Document');
        $documentId = $this->persistenceManager->getIdentifierByObject($document);

        $query = $this->createQuery();
        static::assertSame(3, $query->countAll());

        $imageCount = $this->createQuery();
        $imageCount->setAssetType('Image');
        $imageIdentifiers = $this->identifiersOf($imageCount->findAll());
        static::assertCount(2, $imageIdentifiers);
        static::assertContains($this->persistenceManager->getIdentifierByObject($firstImage), $imageIdentifiers);
        static::assertNotContains($documentId, $imageIdentifiers);
    }

    /**
     * @test
     */
    public function filterByMediaTypeRestrictsToMatchingAssets(): void
    {
        $this->persistFixtures();

        $query = $this->createQuery();
        $query->setMediaType('image/jpeg');
        $identifiers = $this->identifiersOf($query->findAll());

        static::assertCount(2, $identifiers);
    }

    /**
     * @test
     */
    public function orderByResourceFilenameSortsResults(): void
    {
        $this->persistFixtures();

        $query = $this->createQuery();
        $query->setOrderings(['resource.filename' => 'ASC']);
        $identifiers = $this->identifiersOf($query->findAll());

        static::assertCount(3, $identifiers);
    }

    /**
     * @test
     */
    public function findByTagReturnsOnlyTaggedAssets(): void
    {
        $firstImage = $this->persistFixtures();
        $tag = $this->tagRepository->findOneByLabel('DemoTag');

        $query = $this->createQuery();
        $identifiers = $this->identifiersOf($query->findByTag($tag));

        static::assertCount(1, $identifiers);
        static::assertContains($this->persistenceManager->getIdentifierByObject($firstImage), $identifiers);
        static::assertSame(1, $query->countByTag($tag));
    }

    /**
     * @test
     */
    public function findUntaggedReturnsAssetsWithoutTags(): void
    {
        $this->persistFixtures();

        $query = $this->createQuery();
        $identifiers = $this->identifiersOf($query->findUntagged());

        static::assertCount(2, $identifiers);
        static::assertSame(2, $query->countUntagged());
    }

    /**
     * @test
     */
    public function filterAssetsInCollectionsExcludesAssetsInCollections(): void
    {
        $this->persistFixtures();

        $query = $this->createQuery();
        $query->setFilterAssetsInCollections(true);
        $identifiers = $this->identifiersOf($query->findAll());

        static::assertCount(2, $identifiers);
    }

    /**
     * @test
     */
    public function findBySearchTermFindsAssetsWithMatchingMetaData(): void
    {
        if (!$this->usesMySql()) {
            static::markTestSkipped('MetaData-driven search requires a MySQL database (MetaData storage uses MySQL-specific SQL).');
        }

        $firstImage = $this->persistFixtures();
        $identifier = $this->persistenceManager->getIdentifierByObject($firstImage);

        $metaDataManager = $this->objectManager->get(MetaDataManager::class);
        $metaDataManager->setMetaDataPropertyValue(
            MetaDataAssetReference::create('neos', $identifier),
            'copyright',
            'UniqueSearchTermToken'
        );

        $query = $this->createQuery();
        $identifiers = $this->identifiersOf($query->findBySearchTerm('UniqueSearchTermToken'));

        static::assertCount(1, $identifiers);
        static::assertContains($identifier, $identifiers);
    }

    private function usesMySql(): bool
    {
        $platform = $this->entityManager->getConnection()->getDatabasePlatform();
        return $platform instanceof AbstractMySQLPlatform;
    }
}
