<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Mapping;

use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindAncestorNodesFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Node;
use Neos\ContentRepository\Core\Projection\ContentGraph\Subtree;
use Neos\ContentRepositoryRegistry\ContentRepositoryRegistry;
use Neos\Flow\Annotations as Flow;
use Flowpack\Media\Ui\GraphQL\Types;

use function Wwwision\Types\instantiate;

/**
 * @internal only for use within Flowpack.Media.Ui
 */
#[Flow\Scope('singleton')]
class AssetCollectionMapper
{
    #[Flow\Inject]
    protected ContentRepositoryRegistry $contentRepositoryRegistry;

    /**
     * @return array<int,Types\AssetCollection>
     */
    public function mapSubtreeToAssetCollections(Subtree $subtree, string $pathSoFar): array
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

    public function mapNodeToAssetCollection(Node $node): Types\AssetCollection
    {
        return instantiate(Types\AssetCollection::class, [
            'id' => $node->aggregateId->value,
            'title' => $node->getProperty('name') ?: '',
            'path' => $this->findPath($node),
        ]);
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
}
