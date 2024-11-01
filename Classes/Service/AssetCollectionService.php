<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Service;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\ResultSetMapping;
use Flowpack\Media\Ui\Domain\Model\HierarchicalAssetCollectionInterface;
use Flowpack\Media\Ui\Utility\AssetCollectionUtility;
use Neos\ContentRepository\Domain\Service\ContextFactoryInterface;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\ObjectManagement\ObjectManagerInterface;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Repository\AssetCollectionRepository;
use Neos\Neos\Domain\Service\ContentContext;

/**
 * @Flow\Scope("singleton")
 */
class AssetCollectionService
{
    /**
     * @Flow\Inject
     * @var EntityManagerInterface
     */
    protected $entityManager;

    /**
     * @Flow\Inject
     * @var ObjectManagerInterface
     */
    protected $objectManager;

    protected array $assetCollectAssetCountCache = [];

    /**
     * @Flow\Inject
     * @var AssetCollectionRepository
     */
    protected $assetCollectionRepository;

    /**
     * @Flow\Inject
     * @var ContextFactoryInterface
     */
    protected $contextFactory;

    /**
     * Queries the asset count for all asset collections once and caches the result.
     * This helps to avoid a lot of slow queries when rendering the asset collection list.
     */
    public function getAssetCollectionAssetCount(string $assetCollectionId): int
    {
        if (!empty($this->assetCollectAssetCountCache)) {
            return $this->assetCollectAssetCountCache[$assetCollectionId] ?? 0;
        }

        $rsm = new ResultSetMapping();
        $rsm->addScalarResult('id', 'id');
        $rsm->addScalarResult('c', 'count', 'integer');

        // Optimised query with a subselect which is about 3x faster than a JOIN query to check the `dtype` of the asset
        $queryString = "
            SELECT collectionmm.media_assetcollection id, count(*) c
                FROM neos_media_domain_model_assetcollection_assets_join collectionmm
                WHERE NOT EXISTS (
                    SELECT 1 FROM neos_media_domain_model_imagevariant variant
                    WHERE collectionmm.media_asset = variant.persistence_object_identifier
                )
                GROUP BY collectionmm.media_assetcollection;
        ";

        $query = $this->entityManager->createNativeQuery($queryString, $rsm);

        try {
            $result = $query->getArrayResult();
            $this->assetCollectAssetCountCache = array_reduce($result, static function ($carry, $item) {
                $carry[$item['id']] = $item['count'];
                return $carry;
            }, []);
        } catch (\Exception $e) {}

        return $this->assetCollectAssetCountCache[$assetCollectionId] ?? 0;
    }

    public function updatePathForNestedAssetCollections(HierarchicalAssetCollectionInterface $parentCollection): void
    {
        $childCollections = $this->assetCollectionRepository->findByParent($parentCollection);

        foreach ($childCollections as $childCollection) {
            $childCollection->setPath(AssetCollectionUtility::renderValidPath($childCollection));
            $this->assetCollectionRepository->update($childCollection);
            $this->updatePathForNestedAssetCollections($childCollection);
        }
    }

    /**
     * Returns the default asset collection for the current site if available
     */
    public function getDefaultCollectionForCurrentSite(): ?AssetCollection
    {
        /** @var ContentContext $context */
        $context = $this->contextFactory->create([
            'workspaceName' => 'live',
        ]);

        return $context->getCurrentSite()?->getAssetCollection();
    }
}
