<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Service;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\ResultSetMapping;
use Flowpack\Media\Ui\Domain\Model\HierarchicalAssetCollectionInterface;
use Flowpack\Media\Ui\GraphQL\Types;
use Flowpack\Media\Ui\Utility\AssetCollectionUtility;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\ObjectManagement\ObjectManagerInterface;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Repository\AssetCollectionRepository;
use Neos\Neos\Domain\Repository\DomainRepository;

#[Flow\Scope('singleton')]
class AssetCollectionService
{

    protected array $assetCollectAssetCountCache = [];

    /**
     * @var EntityManagerInterface
     */
    #[Flow\Inject]
    protected $entityManager;

    /**
     * @var ObjectManagerInterface
     */
    #[Flow\Inject]
    protected $objectManager;

    #[Flow\Inject]
    protected AssetCollectionRepository $assetCollectionRepository;

    #[Flow\Inject]
    protected DomainRepository $domainRepository;

    /**
     * Queries the asset count for all asset collections once and caches the result.
     * This helps to avoid a lot of slow queries when rendering the asset collection list.
     */
    public function getAssetCollectionAssetCount(Types\AssetCollectionId $assetCollectionId): int
    {
        if (!empty($this->assetCollectAssetCountCache)) {
            return $this->assetCollectAssetCountCache[$assetCollectionId->value] ?? 0;
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

        return $this->assetCollectAssetCountCache[$assetCollectionId->value] ?? 0;
    }

    public function updatePathForNestedAssetCollections(HierarchicalAssetCollectionInterface $parentCollection): void
    {
        /** @noinspection PhpUndefinedMethodInspection */
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
        $domain = $this->domainRepository->findOneByActiveRequest();
        if ($domain !== null) {
            return $domain->getSite()->getAssetCollection();
        }

        return null;
    }
}
