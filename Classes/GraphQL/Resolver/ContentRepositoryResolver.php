<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver;

use Flowpack\Media\Ui\GraphQL\Types\AssetCollectionParent;
use Flowpack\Media\Ui\GraphQL\Types\AssetId;
use Flowpack\Media\Ui\GraphQL\Types\Assets;
use Flowpack\Media\Ui\GraphQL\Types\AssetSource;
use Flowpack\Media\Ui\GraphQL\Types\AssetVariants;
use Flowpack\Media\Ui\GraphQL\Types\Filename;
use Flowpack\Media\Ui\GraphQL\Types\LocalAssetId;
use Neos\ContentRepository\Core\DimensionSpace\DimensionSpacePoint;
use Neos\ContentRepository\Core\NodeType\NodeTypeName;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\CountDescendantNodesFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindAncestorNodesFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindChildNodesFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindDescendantNodesFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindReferencesFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindSubtreeFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Node;
use Neos\ContentRepository\Core\Projection\ContentGraph\Nodes;
use Neos\ContentRepository\Core\Projection\ContentGraph\Subtree;
use Neos\ContentRepository\Core\SharedModel\ContentRepository\ContentRepositoryId;
use Neos\ContentRepository\Core\SharedModel\Node\NodeAggregateId;
use Neos\ContentRepository\Core\SharedModel\Node\ReferenceName;
use Neos\ContentRepository\Core\SharedModel\Workspace\WorkspaceName;
use Neos\ContentRepositoryRegistry\ContentRepositoryRegistry;
use Neos\Flow\Annotations as Flow;
use Neos\Neos\Domain\SubtreeTagging\NeosVisibilityConstraints;
use Flowpack\Media\Ui\GraphQL\Types;

use Wwwision\Types\Attributes\Description;

use function Wwwision\Types\instantiate;

#[Flow\Scope('singleton')]
class ContentRepositoryResolver
{
    #[Flow\Inject]
    protected ContentRepositoryRegistry $contentRepositoryRegistry;

    public function countAssets(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        DimensionSpacePoint $dimensionSpacePoint,
    ): int {
        $subgraph = $this->contentRepositoryRegistry->get($contentRepositoryId)
            ->getContentSubgraph($workspaceName, $dimensionSpacePoint);

        return $subgraph->countDescendantNodes(
            $this->requireMediaRootId($contentRepositoryId, $workspaceName),
            CountDescendantNodesFilter::create(nodeTypes: 'Flowpack.Media:Asset')
        );
    }

    public function findAssets(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        DimensionSpacePoint $dimensionSpacePoint,
    ): Types\Assets {
        $subgraph = $this->contentRepositoryRegistry->get($contentRepositoryId)
            ->getContentSubgraph($workspaceName, $dimensionSpacePoint);

        return $this->mapNodesToAssets(
            $subgraph->findDescendantNodes(
                $this->requireMediaRootId($contentRepositoryId, $workspaceName),
                FindDescendantNodesFilter::create(nodeTypes: 'Flowpack.Media:Asset'),
            )
        );
    }

    public function findAsset(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        DimensionSpacePoint $dimensionSpacePoint,
        NodeAggregateId $nodeAggregateId,
    ): ?Types\Asset {
        $assetNode = $this->findNodeByIdAndType(
            $contentRepositoryId,
            $workspaceName,
            $dimensionSpacePoint,
            $nodeAggregateId,
            NodeTypeName::fromString('Flowpack.Media:Asset'),
        );

        return $assetNode
            ? $this->mapNodeToAsset($assetNode)
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
            FindSubtreeFilter::create(nodeTypes: 'Flowpack.Media:Folder')
        );

        return Types\AssetCollections::fromArray($subtree ? $this->mapSubtreeToAssetCollections($subtree, '') : []);
    }

    public function findAssetCollection(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        DimensionSpacePoint $dimensionSpacePoint,
        NodeAggregateId $assetCollectionId,
    ): ?Types\AssetCollection {
        $assetCollectionNode = $this->findNodeByIdAndType(
            $contentRepositoryId,
            $workspaceName,
            $dimensionSpacePoint,
            $assetCollectionId,
            NodeTypeName::fromString('Flowpack.Media:Folder')
        );

        return $assetCollectionNode
            ? $this->mapNodeToAssetCollection($assetCollectionNode)
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
            ?->isOfType(NodeTypeName::fromString('Flowpack.Media:Folder'))
            ? instantiate(AssetCollectionParent ::class, [
                'id' => $parentNode->aggregateId->value,
                'title' => $parentNode->getProperty('name') ?: '',
            ])
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

        return $this->mapNodesToTags(
            $subgraph->findReferences(
                $folderId,
                FindReferencesFilter::create(referenceName: ReferenceName::fromString('tags'))
            )->getNodes()
        );
    }

    public function findAssetVariants(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        DimensionSpacePoint $dimensionSpacePoint,
        NodeAggregateId $assetId,
    ): Types\AssetVariants {
        $subgraph = $this->contentRepositoryRegistry->get($contentRepositoryId)
            ->getContentSubgraph($workspaceName, $dimensionSpacePoint);

        return $this->mapNodesToAssetVariants(
            $subgraph->findChildNodes(
                $assetId,
                FindChildNodesFilter::create(nodeTypes: 'Flowpack.Media:AssetVariant')
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

        return $this->mapNodesToTags(
            $subgraph->findChildNodes(
                $this->requireMediaRootId($contentRepositoryId, $workspaceName),
                FindChildNodesFilter::create(nodeTypes: 'Flowpack.Media:Tag'),
            )
        );
    }

    public function findTag(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        DimensionSpacePoint $dimensionSpacePoint,
        NodeAggregateId $tagId,
    ): ?Types\Tag {
        $tagNode = $this->findNodeByIdAndType(
            $contentRepositoryId,
            $workspaceName,
            $dimensionSpacePoint,
            $tagId,
            NodeTypeName::fromString('Flowpack.Media:Tag')
        );

        return $tagNode
            ? $this->mapNodeToTag($tagNode)
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

    private function findPath(Node $node): string
    {
        return implode(
            '/',
            $this->contentRepositoryRegistry->subgraphForNode($node)->findAncestorNodes(
                $node->aggregateId,
                FindAncestorNodesFilter::create(nodeTypes: '!Flowpack.Media:Media')
            )->reverse()->toNodeAggregateIds()->toStringArray(),
        );
    }

    private function requireMediaRootId(ContentRepositoryId $contentRepositoryId, WorkspaceName $workspaceName): NodeAggregateId
    {
        $rootNodeAggregate = $this->contentRepositoryRegistry->get($contentRepositoryId)
            ->getContentGraph($workspaceName)
            ->findRootNodeAggregateByType(NodeTypeName::fromString('Flowpack.Media:Media'));

        if (!$rootNodeAggregate) {
            throw new \RuntimeException('Media root node is missing');
        }

        return $rootNodeAggregate->nodeAggregateId;
    }

    /**
     * @return array<int,Types\AssetCollection>
     */
    private function mapSubtreeToAssetCollections(Subtree $subtree, string $pathSoFar): array
    {
        $assetCollections = [];
        if ($subtree->node->nodeTypeName->value !== 'Flowpack.Media:Media') {
            $path = $pathSoFar . '/' . $subtree->node->aggregateId->value;
            $assetCollections[] = $this->mapNodeToAssetCollection($subtree->node);
        } else {
            $path = $pathSoFar;
        }

        foreach ($subtree->children as $childSubtree) {
            $assetCollections = array_merge(
                $assetCollections,
                $this->mapSubtreeToAssetCollections($childSubtree, $path),
            );
        }

        return $assetCollections;
    }

    private function mapNodeToAssetCollection(Node $node): Types\AssetCollection
    {
        return instantiate(Types\AssetCollection::class, [
            'id' => $node->aggregateId->value,
            'title' => $node->getProperty('name') ?: '',
            'path' => $this->findPath($node),
        ]);
    }

    private function mapNodesToAssets(Nodes $nodes): Types\Assets
    {
        return Types\Assets::fromArray(
            $nodes->map(
                fn (Node $node): Types\Asset => $this->mapNodeToAsset($node)
            )
        );
    }

    private function mapNodeToAsset(Node $node): Types\Asset
    {
        return instantiate(
            Types\Asset::class,
            [
                'id' => $node->aggregateId->value,
                'filename' => 'TODO-implement-me.jpg',
                'assetSource' => 'cr:' . $node->contentRepositoryId->value,
                'width' => null, // @todo implement me
                'height' => null, // @todo implement me
                'localId' => null,
            ]
        );
    }

    private function mapNodesToAssetVariants(Nodes $nodes): Types\AssetVariants
    {
        return AssetVariants::fromArray(
            $nodes->map(
                fn (Node $node): Types\AssetVariant => $this->mapNodeToAssetVariant($node)
            )
        );
    }

    private function mapNodeToAssetVariant(Node $node): Types\AssetVariant
    {
        return instantiate(
            Types\AssetVariant::class,
            [
                'id' => $node->aggregateId->value,
                'width' => null, // @todo implement me
                'height' => null, // @todo implement me
                'variantName' => $node->getProperty('variantName'),
                'presetIdentifier' => $node->getProperty('presetIdentifier'),
            ]
        );
    }

    private function mapNodesToTags(Nodes $nodes): Types\Tags
    {
        return Types\Tags::fromArray($nodes->map(
            fn (Node $tag): Types\Tag => $this->mapNodeToTag($tag)
        ));
    }

    private function mapNodeToTag(Node $node): Types\Tag
    {
        return instantiate(
            Types\Tag::class,
            [
                'id' => $node->aggregateId->value,
                'label' => $node->getProperty('name') ?: '',
            ]
        );
    }
}
