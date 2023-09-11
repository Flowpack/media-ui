<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Service;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\ResultSetMapping;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\ObjectManagement\ObjectManagerInterface;

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

    protected $assetCollectAssetCountCache = [];

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
        $rsm->addScalarResult('c', 'count');

        $queryString = "
            SELECT collectionmm.media_assetcollection id, count(*) c
                FROM neos_media_domain_model_assetcollection_assets_join collectionmm
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
}
