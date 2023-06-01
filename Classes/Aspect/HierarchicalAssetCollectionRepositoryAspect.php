<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Aspect;

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
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Flowpack\Media\Ui\Domain\Model\HierarchicalAssetCollectionInterface;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Aop\JoinPointInterface;
use Neos\Flow\Persistence\QueryResultInterface;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Repository\AssetCollectionRepository;
use Neos\Utility\ObjectAccess;

/**
 * An aspect for adding hierarchical relations to the Neos.Media AssetCollection entity
 * This is a AOP patch until the same functionality is merged into the Neos core
 *
 * @Flow\Aspect
 */
class HierarchicalAssetCollectionRepositoryAspect
{
    /**
     * Remove all child collections recursively to prevent orphaned collections
     *
     * @Flow\Around("method(Neos\Media\Domain\Repository\AssetCollectionRepository->remove())")
     */
    public function remove(JoinPointInterface $joinPoint): void
    {
        /** @var AssetCollectionRepository $assetCollection */
        $assetCollectionRepository = $joinPoint->getProxy();
        /** @var AssetCollection $assetCollection */
        $assetCollection = $joinPoint->getMethodArgument('object');
        $persistenceManager = ObjectAccess::getProperty($assetCollectionRepository, 'persistenceManager', true);

        $deleteRecursively = static function (AssetCollection $collection) use (&$deleteRecursively, $persistenceManager, $assetCollectionRepository) {
            $childCollections = $assetCollectionRepository->findByParent($collection);
            foreach ($childCollections as $childCollection) {
                $deleteRecursively($childCollection);
            }
            $persistenceManager->remove($collection);
        };
        $deleteRecursively($assetCollection);
    }
}
