<?php

declare(strict_types=1);

namespace Flowpack\Media\Ui\GraphQL\Mutator;

/*
 * This file is part of the Flowpack.Media.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Flowpack\Media\Ui\Exception;
use Flowpack\Media\Ui\GraphQL\Types;
use Neos\ContentRepository\Core\DimensionSpace\DimensionSpacePoint;
use Neos\ContentRepository\Core\DimensionSpace\OriginDimensionSpacePoint;
use Neos\ContentRepository\Core\Feature\NodeCreation\Command\CreateNodeAggregateWithNode;
use Neos\ContentRepository\Core\Feature\NodeModification\Command\SetNodeProperties;
use Neos\ContentRepository\Core\Feature\NodeModification\Dto\PropertyValuesToWrite;
use Neos\ContentRepository\Core\Feature\NodeReferencing\Command\SetNodeReferences;
use Neos\ContentRepository\Core\Feature\NodeReferencing\Dto\NodeReferencesForName;
use Neos\ContentRepository\Core\Feature\NodeReferencing\Dto\NodeReferencesToWrite;
use Neos\ContentRepository\Core\Feature\NodeReferencing\Dto\NodeReferenceToWrite;
use Neos\ContentRepository\Core\NodeType\NodeTypeName;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindAncestorNodesFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindReferencesFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Node;
use Neos\ContentRepository\Core\SharedModel\ContentRepository\ContentRepositoryId;
use Neos\ContentRepository\Core\SharedModel\Node\NodeAggregateId;
use Neos\ContentRepository\Core\SharedModel\Node\ReferenceName;
use Neos\ContentRepository\Core\SharedModel\Workspace\WorkspaceName;
use Neos\ContentRepositoryRegistry\ContentRepositoryRegistry;
use Neos\Flow\Annotations as Flow;

use Neos\Media\Domain\Model\Tag;
use Neos\Neos\Domain\SubtreeTagging\NeosVisibilityConstraints;

use function Wwwision\Types\instantiate;

#[Flow\Scope("singleton")]
class ContentRepositoryMutator
{
    public function __construct(
        private readonly ContentRepositoryRegistry $contentRepositoryRegistry,
    ) {
    }

    public function createTag(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        OriginDimensionSpacePoint $originDimensionSpacePoint,
        Types\TagLabel $label,
        ?Types\AssetCollectionId $assetCollectionId
    ): Types\Tag {
        $tagId = NodeAggregateId::create();

        $contentRepository = $this->contentRepositoryRegistry->get($contentRepositoryId);
        $contentRepository
            ->handle(CreateNodeAggregateWithNode::create(
                workspaceName: $workspaceName,
                nodeAggregateId: $tagId,
                nodeTypeName: NodeTypeName::fromString('Flowpack.Media:Tag'),
                originDimensionSpacePoint: $originDimensionSpacePoint,
                parentNodeAggregateId: $this->requireMediaRootId($contentRepositoryId, $workspaceName),
                initialPropertyValues: PropertyValuesToWrite::fromArray([
                    'name' => $label->value,
                ]),
            ));

        if ($assetCollectionId) {
            $folderId = NodeAggregateId::fromString($assetCollectionId->value);
            $subgraph = $contentRepository->getContentSubgraph($workspaceName, $originDimensionSpacePoint->toDimensionSpacePoint());

            $nodeReferencesToWrite = [];
            foreach (
                $subgraph->findReferences(
                    $folderId,
                    FindReferencesFilter::create(
                        referenceName: ReferenceName::fromString('tags'),
                    )
                ) as $existingReference
            ) {
                $properties = [];
                foreach ($existingReference->properties ?: [] as $propertyName => $propertyValue) {
                    $properties[$propertyName] = $propertyValue;

                }
                $propertyValuesToWrite = $properties !== []
                    ? PropertyValuesToWrite::fromArray($properties)
                    : null;
                $nodeReferencesToWrite[] = $propertyValuesToWrite
                    ? NodeReferenceToWrite::fromTargetAndProperties(
                        $existingReference->node->aggregateId,
                        $propertyValuesToWrite
                    )
                    : NodeReferenceToWrite::fromTarget($existingReference->node->aggregateId);
            };
            $nodeReferencesToWrite[] = NodeReferenceToWrite::fromTarget($tagId);

            $contentRepository
                ->handle(SetNodeReferences::create(
                    workspaceName: $workspaceName,
                    sourceNodeAggregateId: NodeAggregateId::fromString($assetCollectionId->value),
                    sourceOriginDimensionSpacePoint: $originDimensionSpacePoint,
                    references: NodeReferencesToWrite::create(
                        NodeReferencesForName::fromReferences(
                            ReferenceName::fromString('tags'),
                            $nodeReferencesToWrite
                       ),
                    )
                ));
        }

        return instantiate(
            Types\Tag::class,
            [
                'id' => $tagId->value,
                'label' => $label->value,
            ],
        );
    }

    public function updateTag(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        OriginDimensionSpacePoint $originDimensionSpacePoint,
        NodeAggregateId $tagId,
        ?Types\TagLabel $label,
    ): Types\Tag {
        $contentRepository = $this->contentRepositoryRegistry->get($contentRepositoryId);
        if ($label) {
            $contentRepository->handle(SetNodeProperties::create(
                workspaceName: $workspaceName,
                nodeAggregateId: $tagId,
                originDimensionSpacePoint: $originDimensionSpacePoint,
                propertyValues: PropertyValuesToWrite::fromArray([
                    'name' => $label->value,
                ])
            ));
        }

        $subgraph = $contentRepository->getContentSubgraph($workspaceName, $originDimensionSpacePoint->toDimensionSpacePoint());
        $tag = $subgraph->findNodeById($tagId);
        if (!$tag instanceof Node) {
            throw new Exception('Tag not found', 1590659046);
        }

        return instantiate(
            Types\Tag::class,
            [
                'id' => $tag->aggregateId->value,
                'label' => $tag->getProperty('name'),
            ],
        );
    }

    public function createAssetCollection(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        OriginDimensionSpacePoint $originDimensionSpacePoint,
        Types\AssetCollectionTitle $title,
        ?Types\AssetCollectionId $parent,
    ): Types\AssetCollection {
        $contentRepository = $this->contentRepositoryRegistry->get($contentRepositoryId);
        $parentNodeAggregateId = $parent
            ? NodeAggregateId::fromString($parent->value)
            : $this->requireMediaRootId($contentRepositoryId, $workspaceName);

        $nodeAggregateId = NodeAggregateId::create();
        $contentRepository->handle(
            CreateNodeAggregateWithNode::create(
                workspaceName: $workspaceName,
                nodeAggregateId: $nodeAggregateId,
                nodeTypeName: NodeTypeName::fromString('Flowpack.Media:Folder'),
                originDimensionSpacePoint: $originDimensionSpacePoint,
                parentNodeAggregateId: $parentNodeAggregateId,
                initialPropertyValues: PropertyValuesToWrite::fromArray([
                    'name' => $title->value,
                ])
            )
        );
        $subgraph = $contentRepository->getContentGraph($workspaceName)
            ->getSubgraph($originDimensionSpacePoint->toDimensionSpacePoint(), NeosVisibilityConstraints::excludeRemoved());

        $ancestors = $subgraph->findAncestorNodes($nodeAggregateId, FindAncestorNodesFilter::create());

        return instantiate(Types\AssetCollection::class, [
            'id' => $nodeAggregateId->value,
            'title' => $title->value,
            'path' => implode('/', $ancestors->toNodeAggregateIds()->toStringArray()),
        ]);
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
