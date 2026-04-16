<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Resolver;

use Flowpack\Media\Ui\GraphQL\Types\AssetCollectionParent;
use Neos\ContentRepository\Core\DimensionSpace\DimensionSpacePoint;
use Neos\ContentRepository\Core\NodeType\NodeTypeName;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindChildNodesFilter;
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
use Neos\Neos\Domain\NodeLabel\NodeLabelGeneratorInterface;
use Neos\Neos\Domain\SubtreeTagging\NeosVisibilityConstraints;
use Flowpack\Media\Ui\GraphQL\Types;

use function Wwwision\Types\instantiate;

#[Flow\Scope('singleton')]
class ContentRepositoryResolver
{
    #[Flow\Inject]
    protected ContentRepositoryRegistry $contentRepositoryRegistry;

    #[Flow\Inject]
    protected NodeLabelGeneratorInterface $nodeLabelGenerator;

    public function findAssetCollections(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        DimensionSpacePoint $dimensionSpacePoint,
    ): Types\AssetCollections {
        $contentGraph = $this->contentRepositoryRegistry->get($contentRepositoryId)
            ->getContentGraph($workspaceName);
        $subgraph = $contentGraph
            ->getSubgraph($dimensionSpacePoint, NeosVisibilityConstraints::excludeRemoved());
        $subtree = $subgraph->findSubtree(
            $this->requireMediaRootId($contentRepositoryId, $workspaceName),
            FindSubtreeFilter::create(nodeTypes: 'Flowpack.Media:Folder')
        );

        return Types\AssetCollections::fromArray($subtree ? $this->mapSubtreeToAssetCollections($subtree, '') : []);
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
                'title' => $parentNode->getProperty('name') ?: $this->nodeLabelGenerator->getLabel($parentNode),
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

    public function findTags(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        DimensionSpacePoint $dimensionSpacePoint,
    ): Types\Tags {
        $contentRepository = $this->contentRepositoryRegistry->get($contentRepositoryId);
        $subgraph = $contentRepository
            ->getContentSubgraph($workspaceName, $dimensionSpacePoint);

        return $this->mapNodesToTags(
            $subgraph->findChildNodes(
                $this->requireMediaRootId($contentRepositoryId, $workspaceName),
                FindChildNodesFilter::create(nodeTypes: 'Flowpack.Media:Tag'),
            )
        );
    }

    /**
     * @return array<int,Types\AssetCollection>
     */
    private function mapSubtreeToAssetCollections(Subtree $subtree, string $pathSoFar): array
    {
        $assetCollections = [];
        if ($subtree->node->nodeTypeName->value !== 'Flowpack.Media:Media') {
            $path = $pathSoFar . '/' . $subtree->node->aggregateId->value;
            $assetCollections[] = instantiate(Types\AssetCollection::class, [
                'id' => $subtree->node->aggregateId->value,
                'title' => $subtree->node->getProperty('name') ?: $this->nodeLabelGenerator->getLabel($subtree->node),
                'path' => $path,
            ]);
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

    private function mapNodesToTags(Nodes $nodes): Types\Tags
    {
        return Types\Tags::fromArray($nodes->map(
            fn (Node $tag): Types\Tag => instantiate(
                Types\Tag::class,
                [
                    'id' => $tag->aggregateId->value,
                    'label' => $tag->getProperty('name') ?: $this->nodeLabelGenerator->getLabel($tag),
                ]
            )
        ));
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
}
