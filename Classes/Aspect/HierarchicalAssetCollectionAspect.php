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
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Utility\ObjectAccess;

/**
 * An aspect for adding hierarchical relations to the Neos.Media AssetCollection entity
 *
 * @Flow\Introduce("class(Neos\Media\Domain\Model\AssetCollection)", interfaceName="Flowpack\Media\Ui\Domain\Model\HierarchicalAssetCollectionInterface")
 * @Flow\Aspect
 */
class HierarchicalAssetCollectionAspect
{

    /**
     * @var AssetCollection
     * @ORM\ManyToOne(inversedBy="children", cascade={"persist"})
     * @ORM\JoinColumn(onDelete="SET NULL")
     * @Flow\Lazy
     * @Flow\Introduce("class(Neos\Media\Domain\Model\AssetCollection)")
     */
    protected $parent;

    /**
     * @var Collection<AssetCollection>
     * @ORM\OneToMany(mappedBy="parent", orphanRemoval=true)
     * @Flow\Lazy
     * @Flow\Introduce("class(Neos\Media\Domain\Model\AssetCollection)")
     */
    protected $children;

    /**
     * @Flow\Around("method(Neos\Media\Domain\Model\AssetCollection->getParent())")
     */
    public function getParent(JoinPointInterface $joinPoint): ?HierarchicalAssetCollectionInterface
    {
        /** @var HierarchicalAssetCollectionInterface $assetCollection */
        $assetCollection = $joinPoint->getProxy();
        return ObjectAccess::getProperty($assetCollection, 'parent', true);
    }

    /**
     * @Flow\Around("method(Neos\Media\Domain\Model\AssetCollection->setParent())")
     */
    public function setParent(JoinPointInterface $joinPoint): void
    {
        /** @var HierarchicalAssetCollectionInterface $assetCollection */
        $assetCollection = $joinPoint->getProxy();
        /** @var HierarchicalAssetCollectionInterface $parentAssetCollection */
        $parentAssetCollection = $joinPoint->getMethodArgument('parent');
        if (!$parentAssetCollection instanceof AssetCollection && $parentAssetCollection !== null) {
            throw new \InvalidArgumentException('Parent must be an AssetCollection', 1678330583);
        }
        ObjectAccess::setProperty($assetCollection, 'parent', $parentAssetCollection, true);

        // Throw an error if a circular dependency has been detected
        $parent = $assetCollection->getParent();
        $parents = [$parent];
        while ($parent !== null) {
            $parent = $parent->getParent();
            if (in_array($parent, $parents, true)) {
                throw new \InvalidArgumentException('Circular reference detected', 1678330856);
            }
        }
    }

    /**
     * @Flow\Around("method(Neos\Media\Domain\Model\AssetCollection->addChild())")
     */
    public function addChild(JoinPointInterface $joinPoint): void
    {
        /** @var HierarchicalAssetCollectionInterface $assetCollection */
        $assetCollection = $joinPoint->getProxy();
        $childAssetCollection = $joinPoint->getMethodArgument('child');
        if ($childAssetCollection instanceof AssetCollection) {
            throw new \InvalidArgumentException('Child must be an AssetCollection', 1678330906);
        }
        /** @var Collection $children */
        $children = ObjectAccess::getProperty($assetCollection, 'children', true);
        if (!$children->contains($childAssetCollection)) {
            $this->children->add($childAssetCollection);
            $childAssetCollection->setParent($assetCollection);
        }
    }

    /**
     * @Flow\Around("method(Neos\Media\Domain\Model\AssetCollection->getChildren())")
     * @return Collection<HierarchicalAssetCollectionInterface>
     */
    public function getChildren(JoinPointInterface $joinPoint): Collection
    {
        $assetCollection = $joinPoint->getProxy();
        return ObjectAccess::getProperty($assetCollection, 'children', true) ?? new ArrayCollection();
    }

    /**
     * @Flow\Around("method(Neos\Media\Domain\Model\AssetCollection->getTitle())")
     */
    public function getTitle(JoinPointInterface $joinPoint): string
    {
        /** @var AssetCollection $assetCollection */
        $assetCollection = $joinPoint->getProxy();
        return $assetCollection->getTitle();
    }

    /**
     * @Flow\Around("method(Neos\Media\Domain\Model\AssetCollection->getTags())")
     */
    public function getTags(JoinPointInterface $joinPoint): Collection
    {
        /** @var AssetCollection $assetCollection */
        $assetCollection = $joinPoint->getProxy();
        return $assetCollection->getTags();
    }
}
