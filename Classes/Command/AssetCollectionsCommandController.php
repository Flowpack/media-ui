<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\Command;

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
use Flowpack\Media\Ui\Utility\AssetCollectionUtility;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Cli\CommandController;
use Neos\Flow\Persistence\PersistenceManagerInterface;
use Neos\Media\Domain\Model\AssetCollection;
use Neos\Media\Domain\Model\Tag;
use Neos\Media\Domain\Repository\AssetCollectionRepository;

/**
 * @Flow\Scope("singleton")
 */
class AssetCollectionsCommandController extends CommandController
{

    /**
     * @Flow\Inject
     * @var AssetCollectionRepository
     */
    protected $assetCollectionRepository;

    /**
     * @Flow\Inject
     * @var PersistenceManagerInterface
     */
    protected $persistenceManager;

    /**
     * @Flow\Inject
     * @var AssetCollectionService
     */
    protected $assetCollectionService;

    public function hierarchyCommand(): void
    {
        $rows = array_map(function (HierarchicalAssetCollectionInterface $assetCollection) {
            $children = $this->assetCollectionRepository->findByParent($assetCollection)->toArray();

            return [
                $this->persistenceManager->getIdentifierByObject($assetCollection),
                $assetCollection->getTitle(),
                $assetCollection->getParent() ? $this->persistenceManager->getIdentifierByObject($assetCollection->getParent()) : 'None',
                $assetCollection->getParent() ? $assetCollection->getParent()->getTitle() : 'None',
                implode(', ',
                    array_map(static fn(AssetCollection $assetCollection) => $assetCollection->getTitle(), $children)),
                implode("\n",
                    array_map(static fn(Tag $tag) => $tag->getLabel(), $assetCollection->getTags()->toArray())),
                $assetCollection->getPath(),
            ];
        }, $this->assetCollectionRepository->findAll()->toArray());

        $this->output->outputTable($rows, ['Id', 'Title', 'ParentId', 'Parent title', 'Children', 'Tags', 'Path']);
    }

    public function setParentCommand(string $assetCollectionIdentifier, string $parentAssetCollectionIdentifier): void
    {
        /** @var AssetCollection $assetCollection */
        $assetCollection = $this->assetCollectionRepository->findByIdentifier($assetCollectionIdentifier);
        /** @var AssetCollection $parentAssetCollection */
        $parentAssetCollection = $this->assetCollectionRepository->findByIdentifier($parentAssetCollectionIdentifier);
        /** @var HierarchicalAssetCollectionInterface $assetCollection */
        $assetCollection->setParent($parentAssetCollection);
        $this->assetCollectionRepository->update($assetCollection);
        $this->assetCollectionService->updatePathForNestedAssetCollections($assetCollection);
        $this->outputLine(
            'Asset collection "%s" has been set as child of "%s"',
            [$assetCollection->getTitle(), $parentAssetCollection ? $parentAssetCollection->getTitle() : 'none']
        );
    }

    /**
     * Recalculates the path of each `AssetCollection` and updates the database.
     */
    public function updatePathsCommand(): void
    {
        $assetCollections = $this->assetCollectionRepository->findAll();
        /** @var HierarchicalAssetCollectionInterface $assetCollection */
        foreach ($assetCollections as $assetCollection) {
            $path = AssetCollectionUtility::renderValidPath($assetCollection);
            $assetCollection->setPath($path);
            $this->assetCollectionRepository->update($assetCollection);
        }
        $this->outputLine('Paths have been updated for %d asset collections', [$assetCollections->count()]);
    }

}
