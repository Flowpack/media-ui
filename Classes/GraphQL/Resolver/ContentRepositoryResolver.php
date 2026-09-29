<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver;

use Flowpack\Media\Ui\GraphQL\Mapping\AssetCollectionMapper;
use Flowpack\Media\Ui\GraphQL\Mapping\AssetMapper;
use Flowpack\Media\Ui\GraphQL\Mapping\AssetVariantMapper;
use Flowpack\Media\Ui\GraphQL\Mapping\TagMapper;
use Flowpack\Media\Ui\GraphQL\Types\AssetCollectionParent;
use Neos\ContentRepository\Core\ContentRepository;
use Neos\ContentRepository\Core\DimensionSpace\DimensionSpacePoint;
use Neos\ContentRepository\Core\NodeType\NodeTypeName;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\CountDescendantNodesFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindChildNodesFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindDescendantNodesFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindReferencesFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindSubtreeFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Node;
use Neos\ContentRepository\Core\SharedModel\ContentRepository\ContentRepositoryId;
use Neos\ContentRepository\Core\SharedModel\Node\NodeAggregateId;
use Neos\ContentRepository\Core\SharedModel\Node\ReferenceName;
use Neos\ContentRepository\Core\SharedModel\Workspace\WorkspaceName;
use Neos\ContentRepositoryRegistry\ContentRepositoryRegistry;
use Neos\Flow\Annotations as Flow;
use Neos\Neos\Domain\SubtreeTagging\NeosVisibilityConstraints;
use Flowpack\Media\Ui\GraphQL\Types;

use function Wwwision\Types\instantiate;

#[Flow\Scope('singleton')]
class ContentRepositoryResolver
{
    #[Flow\Inject]
    protected ContentRepositoryRegistry $contentRepositoryRegistry;

    #[Flow\Inject]
    protected AssetMapper $assetMapper;

    #[Flow\Inject]
    protected AssetCollectionMapper $assetCollectionMapper;

    #[Flow\Inject]
    protected AssetVariantMapper $assetVariantMapper;

    public function getArbitraryDimensionSpacePoint(ContentRepositoryId $contentRepositoryId): DimensionSpacePoint
    {
        $contentRepository = $this->contentRepositoryRegistry->get($contentRepositoryId);
        $dimensionSpacePoints = $contentRepository->getVariationGraph()->getDimensionSpacePoints()->points;

        return reset($dimensionSpacePoints) ?: DimensionSpacePoint::createWithoutDimensions();
    }

    public function findContentRepositoryAssetSources(WorkspaceName $workspaceName): Types\AssetSources
    {
        $assetContentRepositories = [];
        foreach ($this->contentRepositoryRegistry->getContentRepositoryIds() as $contentRepositoryId) {
            $contentRepository = $this->contentRepositoryRegistry->get($contentRepositoryId);
            if ($contentRepository->getContentGraph($workspaceName)
                ->findRootNodeAggregateByType(NodeTypeName::fromString('Neos.Media:Media'))
            ) {
                $assetContentRepositories['cr:' . $contentRepository->id->value] = $contentRepository;
            }
        }

        return Types\AssetSources::fromArray(array_map(
            static fn (ContentRepository $contentRepository) => Types\AssetSource::fromContentRepository($contentRepository),
            $assetContentRepositories,
        ));
    }

    public function countAssets(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        DimensionSpacePoint $dimensionSpacePoint,
    ): int {
        $subgraph = $this->contentRepositoryRegistry->get($contentRepositoryId)
            ->getContentSubgraph($workspaceName, $dimensionSpacePoint);

        return $subgraph->countDescendantNodes(
            $this->requireMediaRootId($contentRepositoryId, $workspaceName),
            CountDescendantNodesFilter::create(nodeTypes: 'Neos.Media:Asset')
        );
    }

    public function findAssets(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        DimensionSpacePoint $dimensionSpacePoint,
    ): Types\Assets {
        $subgraph = $this->contentRepositoryRegistry->get($contentRepositoryId)
            ->getContentSubgraph($workspaceName, $dimensionSpacePoint);

        return $this->assetMapper->mapNodesToAssets(
            $subgraph->findDescendantNodes(
                $this->requireMediaRootId($contentRepositoryId, $workspaceName),
                FindDescendantNodesFilter::create(nodeTypes: 'Neos.Media:Asset'),
            )
        );
    }

    public function findAsset(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        NodeAggregateId $assetId,
        DimensionSpacePoint $dimensionSpacePoint,
    ): ?Types\Asset {
        $assetNode = $this->findNodeByIdAndType(
            $contentRepositoryId,
            $workspaceName,
            $dimensionSpacePoint,
            $assetId,
            NodeTypeName::fromString('Neos.Media:Asset'),
        );

        return $assetNode
            ? $this->assetMapper->mapNodeToAsset($assetNode)
            : null;
    }

    public function findAssetCollections(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        DimensionSpacePoint $dimensionSpacePoint,
    ): Types\AssetCollections {
        $subgraph = $this->contentRepositoryRegistry->get($contentRepositoryId)
            ->getContentSubgraph($workspaceName, $dimensionSpacePoint);

        $subtree = $subgraph->findSubtree(
            $this->requireMediaRootId($contentRepositoryId, $workspaceName),
            FindSubtreeFilter::create(nodeTypes: 'Neos.Media:Folder')
        );

        return Types\AssetCollections::fromArray($subtree
            ? $this->assetCollectionMapper->mapSubtreeToAssetCollections($subtree, '')
            : []
        );
    }

    public function findAssetCollection(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        NodeAggregateId $assetCollectionId,
        DimensionSpacePoint $dimensionSpacePoint,
    ): ?Types\AssetCollection {
        $assetCollectionNode = $this->findNodeByIdAndType(
            $contentRepositoryId,
            $workspaceName,
            $dimensionSpacePoint,
            $assetCollectionId,
            NodeTypeName::fromString('Neos.Media:Folder')
        );

        return $assetCollectionNode
            ? $this->assetCollectionMapper->mapNodeToAssetCollection($assetCollectionNode)
            : null;
    }

    public function findParentAssetCollection(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        DimensionSpacePoint $dimensionSpacePoint,
        NodeAggregateId $childNodeAggregateId,
    ): ?Types\AssetCollectionParent {
        $contentRepository = $this->contentRepositoryRegistry->get($contentRepositoryId);
        $subgraph = $contentRepository
            ->getContentGraph($workspaceName)
            ->getSubgraph($dimensionSpacePoint, NeosVisibilityConstraints::excludeRemoved());

        $parentNode = $subgraph->findParentNode($childNodeAggregateId);
        if ($parentNode === null) {
            return null;
        }

        return $contentRepository->getNodeTypeManager()->getNodeType($parentNode->nodeTypeName)
            ?->isOfType(NodeTypeName::fromString('Neos.Media:Folder'))
            ? AssetCollectionParent::create(
                Types\AssetCollectionId::fromString($parentNode->aggregateId->value),
                Types\AssetCollectionTitle::fromString($parentNode->getProperty('name') ?: '')
            )
            : null;
    }

    public function findAssetCollectionTags(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        DimensionSpacePoint $dimensionSpacePoint,
        NodeAggregateId $folderId,
    ): Types\Tags {
        $contentRepository = $this->contentRepositoryRegistry->get($contentRepositoryId);
        $subgraph = $contentRepository
            ->getContentSubgraph($workspaceName, $dimensionSpacePoint);

        return TagMapper::mapNodesToTags(
            $subgraph->findReferences(
                $folderId,
                FindReferencesFilter::create(referenceName: ReferenceName::fromString('tags'))
            )->getNodes()
        );
    }

    public function findAssetVariants(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        NodeAggregateId $assetId,
        DimensionSpacePoint $dimensionSpacePoint,
    ): Types\AssetVariants {
        $subgraph = $this->contentRepositoryRegistry->get($contentRepositoryId)
            ->getContentSubgraph($workspaceName, $dimensionSpacePoint);

        return $this->assetVariantMapper->mapNodesToAssetVariants(
            $subgraph->findChildNodes(
                $assetId,
                FindChildNodesFilter::create(nodeTypes: 'Neos.Media:AssetVariant')
            )
        );
    }

    public function findTags(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        DimensionSpacePoint $dimensionSpacePoint,
    ): Types\Tags {
        $subgraph = $this->contentRepositoryRegistry->get($contentRepositoryId)
            ->getContentSubgraph($workspaceName, $dimensionSpacePoint);

        return TagMapper::mapNodesToTags(
            $subgraph->findChildNodes(
                $this->requireMediaRootId($contentRepositoryId, $workspaceName),
                FindChildNodesFilter::create(nodeTypes: 'Neos.Media:Tag'),
            )
        );
    }

    public function findTag(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        NodeAggregateId $tagId,
        DimensionSpacePoint $dimensionSpacePoint,
    ): ?Types\Tag {
        $tagNode = $this->findNodeByIdAndType(
            $contentRepositoryId,
            $workspaceName,
            $dimensionSpacePoint,
            $tagId,
            NodeTypeName::fromString('Neos.Media:Tag')
        );

        return $tagNode
            ? TagMapper::mapNodeToTag($tagNode)
            : null;
    }

    private function findNodeByIdAndType(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        DimensionSpacePoint $dimensionSpacePoint,
        NodeAggregateId $nodeAggregateId,
        NodeTypeName $nodeTypeName,
    ): ?Node {
        $contentRepository = $this->contentRepositoryRegistry->get($contentRepositoryId);
        $subgraph = $contentRepository
            ->getContentSubgraph($workspaceName, $dimensionSpacePoint);

        $node = $subgraph->findNodeById($nodeAggregateId);
        if (
            $node
            && $contentRepository->getNodeTypeManager()
                ->getNodeType($node->nodeTypeName)
                ?->isOfType($nodeTypeName)
        ) {
            return $node;
        }

        return null;
    }

    public function requireMediaRootId(ContentRepositoryId $contentRepositoryId, WorkspaceName $workspaceName): NodeAggregateId
    {
        $rootNodeAggregate = $this->contentRepositoryRegistry->get($contentRepositoryId)
            ->getContentGraph($workspaceName)
            ->findRootNodeAggregateByType(NodeTypeName::fromString('Neos.Media:Media'));

        if (!$rootNodeAggregate) {
            throw new \RuntimeException('Media root node is missing');
        }

        return $rootNodeAggregate->nodeAggregateId;
    }
}
