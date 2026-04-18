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
use Flowpack\Media\Ui\Exception as MediaUiException;
use Flowpack\Media\Ui\GraphQL\Mapping\AssetCollectionMapper;
use Flowpack\Media\Ui\GraphQL\Mapping\AssetMapper;
use Flowpack\Media\Ui\GraphQL\Mapping\TagMapper;
use Flowpack\Media\Ui\GraphQL\Resolver\ResourceResolver;
use Flowpack\Media\Ui\GraphQL\Types;
use Flowpack\Media\Ui\GraphQL\Types\FileUploadResult;
use Flowpack\Media\Ui\GraphQL\Types\MutationResponseMessage;
use Flowpack\Media\Ui\GraphQL\Types\MutationResult;
use GuzzleHttp\Psr7\Uri;
use Neos\ContentRepository\Core\DimensionSpace\DimensionSpacePoint;
use Neos\ContentRepository\Core\DimensionSpace\OriginDimensionSpacePoint;
use Neos\ContentRepository\Core\Feature\NodeCreation\Command\CreateNodeAggregateWithNode;
use Neos\ContentRepository\Core\Feature\NodeModification\Command\SetNodeProperties;
use Neos\ContentRepository\Core\Feature\NodeModification\Dto\PropertyValuesToWrite;
use Neos\ContentRepository\Core\Feature\NodeMove\Command\MoveNodeAggregate;
use Neos\ContentRepository\Core\Feature\NodeMove\Dto\RelationDistributionStrategy;
use Neos\ContentRepository\Core\Feature\NodeReferencing\Command\SetNodeReferences;
use Neos\ContentRepository\Core\Feature\NodeReferencing\Dto\NodeReferencesForName;
use Neos\ContentRepository\Core\Feature\NodeReferencing\Dto\NodeReferencesToWrite;
use Neos\ContentRepository\Core\Feature\NodeReferencing\Dto\NodeReferenceToWrite;
use Neos\ContentRepository\Core\Feature\SubtreeTagging\Command\TagSubtree;
use Neos\ContentRepository\Core\NodeType\NodeTypeName;
use Neos\ContentRepository\Core\Projection\ContentGraph\Filter\FindReferencesFilter;
use Neos\ContentRepository\Core\Projection\ContentGraph\Node;
use Neos\ContentRepository\Core\SharedModel\ContentRepository\ContentRepositoryId;
use Neos\ContentRepository\Core\SharedModel\Exception\NodeAggregateCurrentlyDoesNotExist;
use Neos\ContentRepository\Core\SharedModel\Node\NodeAggregateId;
use Neos\ContentRepository\Core\SharedModel\Node\NodeAggregateIds;
use Neos\ContentRepository\Core\SharedModel\Node\NodeVariantSelectionStrategy;
use Neos\ContentRepository\Core\SharedModel\Node\ReferenceName;
use Neos\ContentRepository\Core\SharedModel\Workspace\WorkspaceName;
use Neos\ContentRepositoryRegistry\ContentRepositoryRegistry;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\I18n\Translator;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Neos\Domain\SubtreeTagging\NeosSubtreeTag;
use Neos\Utility\MediaTypes;
use Psr\Http\Message\UriInterface;

#[Flow\Scope("singleton")]
class ContentRepositoryMutator
{
    public function __construct(
        private readonly ContentRepositoryRegistry $contentRepositoryRegistry,
        private readonly AssetMapper $assetMapper,
        private readonly AssetCollectionMapper $assetCollectionMapper,
        private readonly Translator $translator,
        private readonly ResourceMutator $resourceMutator,
        private readonly ResourceResolver $resourceResolver,
    ) {
    }

    public function createAsset(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        OriginDimensionSpacePoint $originDimensionSpacePoint,
        NodeAggregateId $parentNodeAggregateId,
        Types\UploadedFile $file,
        ?NodeAggregateIds $tags,
    ): Types\FileUploadResult {
        $resource = $this->resourceMutator->importResource($file);
        if (!$resource) {
            return Types\FileUploadResult::fromError('WAT');
        }

        /** @var string $mediaType (already checked) */
        $mediaType = $file->clientMediaType;
        $this->createNode(
            contentRepositoryId: $contentRepositoryId,
            workspaceName: $workspaceName,
            nodeTypeName: NodeTypeName::fromString(match (MediaTypes::parseMediaType($mediaType)['type']) {
                'audio' => 'Neos.Media:Audio',
                'document' => 'Neos.Document:Document',
                'image' => 'Neos.Media:Image',
                'video' => 'Neos.Media:Video',
                default => throw new \Exception('Unsupported media type ' . $mediaType),
            }),
            originDimensionSpacePoint: $originDimensionSpacePoint,
            parentNodeAggregateId: $parentNodeAggregateId,
            initialProperties: PropertyValuesToWrite::fromArray([
                'resourceUri' => new Uri(
                    'persistentResource://'
                    . $resource->getCollectionName()
                    /** @phpstan-ignore property.notFound (it's magic) */
                    . '/' . $resource->Persistent_Object_Identifier
                ),
            ]),
            initialReferences: $tags
                ? NodeReferencesToWrite::create(
                    NodeReferencesForName::fromTargets(
                        name: ReferenceName::fromString('tags'),
                        nodeAggregateIds: $tags,
                    )
                )
                : null,
        );

        return FileUploadResult::fromSuccess(
            'SUCCESS',
            $file->clientFilename ? Types\Filename::fromString($file->clientFilename) : null
        );
    }

    public function updateAsset(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        NodeAggregateId $assetId,
        OriginDimensionSpacePoint $originDimensionSpacePoint,
        PropertyValuesToWrite $propertyValuesToWrite,
    ): Types\Asset {
        $assetNode = $this->findNodeByIdAndType(
            $contentRepositoryId,
            $workspaceName,
            $assetId,
            $originDimensionSpacePoint->toDimensionSpacePoint(),
            NodeTypeName::fromString('Neos.Media:Asset'),
        );
        if (!$assetNode) {
            throw new MediaUiException('Cannot update asset that was never imported', 1590659044);
        }

        $updatedAssetNode = $this->setNodeProperties($assetNode, $propertyValuesToWrite);

        return $this->assetMapper->mapNodeToAsset($updatedAssetNode);
    }

    public function tagAsset(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        NodeAggregateId $assetId,
        OriginDimensionSpacePoint $originDimensionSpacePoint,
        NodeAggregateId $tagId,
    ): Types\Asset {
        $assetNode = $this->findNodeByIdAndType(
            $contentRepositoryId,
            $workspaceName,
            $assetId,
            $originDimensionSpacePoint->toDimensionSpacePoint(),
            NodeTypeName::fromString('Neos.Media:Asset'),
        );
        if (!$assetNode) {
            throw new MediaUiException('Cannot update asset that was never imported', 1590659044);
        }

        $taggedAssetNode = $this->tagNode($assetNode, $tagId);

        return $this->assetMapper->mapNodeToAsset($taggedAssetNode);
    }

    public function untagAsset(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        NodeAggregateId $assetId,
        OriginDimensionSpacePoint $originDimensionSpacePoint,
        NodeAggregateId $tagId,
    ): Types\Asset {
        $assetNode = $this->findNodeByIdAndType(
            $contentRepositoryId,
            $workspaceName,
            $assetId,
            $originDimensionSpacePoint->toDimensionSpacePoint(),
            NodeTypeName::fromString('Neos.Media:Asset'),
        );
        if (!$assetNode) {
            throw new MediaUiException('Cannot update asset that was never imported', 1590659044);
        }

        $taggedAssetNode = $this->untagNode($assetNode, $tagId);

        return $this->assetMapper->mapNodeToAsset($taggedAssetNode);
    }

    public function removeAsset(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        NodeAggregateId $assetId,
        DimensionSpacePoint $dimensionSpacePoint,
    ): MutationResult {
        $assetNode = $this->findNodeByIdAndType(
            contentRepositoryId: $contentRepositoryId,
            workspaceName: $workspaceName,
            nodeAggregateId: $assetId,
            dimensionSpacePoint: $dimensionSpacePoint,
            nodeTypeName: NodeTypeName::fromString('Neos.Media:Asset'),
        );

        if (!$assetNode) {
            return MutationResult::fromError([
                $this->getLocalizedMessage(
                    'actions.deleteAssets.noProxy',
                    'Asset could not be resolved',
                )
            ]);
        }

        try {
            $this->contentRepositoryRegistry->get($contentRepositoryId)
                ->handle(TagSubtree::create(
                    $workspaceName,
                    $assetId,
                    $dimensionSpacePoint,
                    NodeVariantSelectionStrategy::STRATEGY_ALL_VARIANTS,
                    NeosSubtreeTag::removed(),
                ));
        } catch (\Throwable) {
            return MutationResult::fromError([
                $this->getLocalizedMessage(
                    'actions.deleteAssets.noProxy',
                    'Asset could not be resolved',
                )
            ]);
        }
        return MutationResult::fromSuccess([
            $this->getLocalizedMessage(
                'actions.deleteAssets.success',
                'Asset deleted',
            )
        ]);
    }

    public function setAssetTags(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        NodeAggregateId $assetId,
        OriginDimensionSpacePoint $originDimensionSpacePoint,
        NodeAggregateIds $tagIds,
    ): Types\Asset {
        $assetNode = $this->findNodeByIdAndType(
            $contentRepositoryId,
            $workspaceName,
            $assetId,
            $originDimensionSpacePoint->toDimensionSpacePoint(),
            NodeTypeName::fromString('Neos.Media:Asset'),
        );

        if (!$assetNode) {
            throw new MediaUiException('Cannot tag asset that was never imported', 1594621322);
        }

        try {
            $assetNodeWithNewTags = $this->setNodeTags($assetNode, $tagIds);
        } catch (NodeAggregateCurrentlyDoesNotExist) {
            throw new MediaUiException('Cannot tag asset with tag that does not exist', 1594621318);
        }

        return $this->assetMapper->mapNodeToAsset($assetNodeWithNewTags);
    }

    public function setAssetCollection(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        NodeAggregateId $assetId,
        OriginDimensionSpacePoint $originDimensionSpacePoint,
        NodeAggregateId $folderId,
    ): Types\Asset {
        $assetNode = $this->findNodeByIdAndType(
            $contentRepositoryId,
            $workspaceName,
            $assetId,
            $originDimensionSpacePoint->toDimensionSpacePoint(),
            NodeTypeName::fromString('Neos.Media:Asset'),
        );

        if (!$assetNode) {
            throw new MediaUiException('Cannot assign collections to asset that was never imported', 1594621322);
        }

        try {
            $assetNodeWithNewTags = $this->moveNode($assetNode, $folderId);
        } catch (NodeAggregateCurrentlyDoesNotExist) {
            throw new MediaUiException('Cannot assign non existing assign collection to asset', 1594621318);
        }

        return $this->assetMapper->mapNodeToAsset($assetNodeWithNewTags);
    }

    public function replaceAssetResource(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        NodeAggregateId $assetId,
        OriginDimensionSpacePoint $originDimensionSpacePoint,
        Types\UploadedFile $file,
        Types\AssetReplacementOptions $options,
    ): Types\FileUploadResult {
        $asset = $this->findNodeByIdAndType(
            contentRepositoryId: $contentRepositoryId,
            workspaceName: $workspaceName,
            nodeAggregateId: $assetId,
            dimensionSpacePoint: $originDimensionSpacePoint->toDimensionSpacePoint(),
            nodeTypeName: NodeTypeName::fromString('Neos.Media:Asset'),
        );
        if (!$asset) {
            throw new MediaUiException('Cannot replace resource of asset that was never imported', 1648046173);
        }
        $contentRepository = $this->contentRepositoryRegistry->get($contentRepositoryId);
        /** @todo resolve resource collection from CR, folder or similar */
        $resourceCollectionName = ResourceManager::DEFAULT_PERSISTENT_COLLECTION_NAME;
        try {
            $overrideFilename = null;
            if (
                $options->keepOriginalFilename
                && ($currentResourceUri = $asset->getProperty('resourceUri')) instanceof UriInterface
            ) {
                $overrideFilename = $this->resourceResolver->getFilename($currentResourceUri);
            }
            $resource = $this->resourceMutator->importResource(
                file: $file,
                assetNodeType: $this->contentRepositoryRegistry->get($contentRepositoryId)
                    ->getNodeTypeManager()->getNodeType($asset->nodeTypeName),
                resourceCollectionName: $resourceCollectionName,
                overrideFilename: $overrideFilename,
            );
        } catch (\Throwable $e) {
            throw new MediaUiException($e->getMessage(), $e->getCode(), $e);
        }

        $contentRepository->handle(SetNodeProperties::create(
            workspaceName: $workspaceName,
            nodeAggregateId: $assetId,
            originDimensionSpacePoint: $originDimensionSpacePoint,
            propertyValues: PropertyValuesToWrite::fromArray([
                'resourceUri' => new Uri(
                    'persistentResource://'
                    . $resourceCollectionName
                    /** @phpstan-ignore property.nonObject (it's magic) */
                    . '/' . $resource->Persistent_Object_Identifier
                ),
            ])
        ));

        return Types\FileUploadResult::fromSuccess('SUCCESS');
    }

    public function renameAssetResource(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        NodeAggregateId $assetId,
        OriginDimensionSpacePoint $originDimensionSpacePoint,
        string $filename,
        Types\AssetEditOptions $options,
    ): Types\MutationResult {
        $asset = $this->findNodeByIdAndType(
            contentRepositoryId: $contentRepositoryId,
            workspaceName: $workspaceName,
            nodeAggregateId: $assetId,
            dimensionSpacePoint: $originDimensionSpacePoint->toDimensionSpacePoint(),
            nodeTypeName: NodeTypeName::fromString('Neos.Media:Asset'),
        );
        if (!$asset) {
            throw new MediaUiException('Cannot rename resource of non-existing asset', 1776526847);
        }

        $originalResourceUri = $asset->getProperty('resourceUri');
        $originalResource = $originalResourceUri ? $this->resourceResolver->findResource($originalResourceUri) : null;
        if (!$originalResource) {
            throw new MediaUiException('Cannot rename non-existing resource', 1776527017);
        }
        $renamedResource = $this->resourceMutator->renameResource(
            originalResource: $originalResource,
            filename: $filename,
            assetLabel: $asset->getProperty('name') ?: ''
        );
        $contentRepository = $this->contentRepositoryRegistry->get($contentRepositoryId);

        $contentRepository->handle(SetNodeProperties::create(
            workspaceName: $workspaceName,
            nodeAggregateId: $assetId,
            originDimensionSpacePoint: $originDimensionSpacePoint,
            propertyValues: PropertyValuesToWrite::fromArray([
                'resourceUri' => new Uri(
                    'persistentResource://'
                    . $renamedResource->getCollectionName()
                    /** @phpstan-ignore property.notFound (it's magic) */
                    . '/' . $renamedResource->Persistent_Object_Identifier
                ),
            ])
        ));

        return Types\MutationResult::fromSuccess();
    }

    public function createTag(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        OriginDimensionSpacePoint $originDimensionSpacePoint,
        Types\TagLabel $label,
        ?NodeAggregateId $folderId,
    ): Types\Tag {
        $tagId = NodeAggregateId::create();

        $tagNode = $this->createNode(
            $contentRepositoryId,
            $workspaceName,
            NodeTypeName::fromString('Neos.Media:Tag'),
            $originDimensionSpacePoint,
            $this->requireMediaRootId($contentRepositoryId, $workspaceName),
            PropertyValuesToWrite::fromArray([
                'name' => $label->value,
            ])
        );

        if ($folderId) {
            $folderNode = $this->findNodeByIdAndType(
                $contentRepositoryId,
                $workspaceName,
                $folderId,
                $originDimensionSpacePoint->toDimensionSpacePoint(),
                NodeTypeName::fromString('Neos.Media:Folder'),
            );
            if (!$folderNode) {
                throw new Exception('Asset collection not found', 1603921193);
            }
            $this->tagNode($folderNode, $tagId);
        }

        return TagMapper::mapNodeToTag($tagNode);
    }

    public function updateTag(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        OriginDimensionSpacePoint $originDimensionSpacePoint,
        NodeAggregateId $tagId,
        ?Types\TagLabel $label,
    ): Types\Tag {
        $tagNode = $this->findNodeByIdAndType(
            contentRepositoryId: $contentRepositoryId,
            workspaceName: $workspaceName,
            nodeAggregateId: $tagId,
            dimensionSpacePoint: $originDimensionSpacePoint->toDimensionSpacePoint(),
            nodeTypeName: NodeTypeName::fromString('Neos.Media:Tag'),
        );
        if (!$tagNode) {
            throw new Exception('Tag not found', 1590659046);
        }

        if ($label) {
            $tagNode = $this->setNodeProperties(
                $tagNode,
                PropertyValuesToWrite::fromArray([
                    'name' => $label->value,
                ])
            );
        }

        return TagMapper::mapNodeToTag($tagNode);
    }

    public function removeTag(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        NodeAggregateId $tagId,
        DimensionSpacePoint $dimensionSpacePoint,
    ): MutationResult {
        $tagNode = $this->findNodeByIdAndType(
            contentRepositoryId: $contentRepositoryId,
            workspaceName: $workspaceName,
            nodeAggregateId: $tagId,
            dimensionSpacePoint: $dimensionSpacePoint,
            nodeTypeName: NodeTypeName::fromString('Neos.Media:Tag'),
        );

        if (!$tagNode) {
            return MutationResult::fromError([
                $this->getLocalizedMessage(
                    'actions.deleteTag.notFound',
                    'Tag not found'
                )
            ]);
        }

        try {
            $this->contentRepositoryRegistry->get($contentRepositoryId)
                ->handle(TagSubtree::create(
                    $workspaceName,
                    $tagId,
                    $dimensionSpacePoint,
                    NodeVariantSelectionStrategy::STRATEGY_ALL_VARIANTS,
                    NeosSubtreeTag::removed(),
                ));
        } catch (\Throwable) {
            return MutationResult::fromError([
                $this->getLocalizedMessage(
                    'actions.deleteTag.notFound',
                    'Tag not found'
                )
            ]);
        }
        return MutationResult::fromSuccess([
            $this->getLocalizedMessage(
                'actions.deleteTag.success',
                'Tag deleted',
            )
        ]);
    }

    public function createAssetCollection(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        OriginDimensionSpacePoint $originDimensionSpacePoint,
        Types\AssetCollectionTitle $title,
        ?NodeAggregateId $parentNodeAggregateId,
    ): Types\AssetCollection {
        $parentNodeAggregateId = $parentNodeAggregateId
            ?: $this->requireMediaRootId($contentRepositoryId, $workspaceName);

        $assetCollectionNode = $this->createNode(
            contentRepositoryId: $contentRepositoryId,
            workspaceName: $workspaceName,
            nodeTypeName: NodeTypeName::fromString('Neos.Media:Folder'),
            originDimensionSpacePoint: $originDimensionSpacePoint,
            parentNodeAggregateId: $parentNodeAggregateId,
            initialProperties: PropertyValuesToWrite::fromArray([
                'name' => $title->value,
            ]),
        );

        return $this->assetCollectionMapper->mapNodeToAssetCollection($assetCollectionNode);
    }

    public function updateAssetCollection(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        NodeAggregateId $folderId,
        DimensionSpacePoint $dimensionSpacePoint,
        ?PropertyValuesToWrite $properties,
        ?NodeAggregateIds $tagIds,
    ): MutationResult {
        $folderNode = $this->findNodeByIdAndType(
            contentRepositoryId: $contentRepositoryId,
            workspaceName: $workspaceName,
            nodeAggregateId: $folderId,
            dimensionSpacePoint: $dimensionSpacePoint,
            nodeTypeName: NodeTypeName::fromString('Neos.Media:Folder'),
        );

        if (!$folderNode) {
            return MutationResult::fromError([
                $this->getLocalizedMessage(
                    'actions.updateAssetCollection.notFound',
                    'Asset collection not found'
                )
            ]);
        }

        if ($properties) {
            $this->setNodeProperties($folderNode, $properties);
        }
        if ($tagIds) {
            $this->setNodeTags($folderNode, $tagIds);
        }

        return MutationResult::fromSuccess();
    }

    public function setParentAssetCollection(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        NodeAggregateId $folderId,
        DimensionSpacePoint $dimensionSpacePoint,
        NodeAggregateId $parentFolderId,
    ): MutationResult {
        $folderNode = $this->findNodeByIdAndType(
            $contentRepositoryId,
            $workspaceName,
            $folderId,
            $dimensionSpacePoint,
            NodeTypeName::fromString('Neos.Media:Folder'),
        );

        if (!$folderNode) {
            return MutationResult::fromError([
                $this->getLocalizedMessage(
                    'actions.setAssetCollectionParent.notFound',
                    'Asset collection not found'
                )
            ]);
        }

        try {
            $this->moveNode($folderNode, $parentFolderId);
        } catch (NodeAggregateCurrentlyDoesNotExist) {
            return MutationResult::fromError([
                $this->getLocalizedMessage(
                    'actions.setAssetCollectionParent.parentNotFound',
                    'Parent asset collection not found'
                )
            ]);
        }

        return MutationResult::fromSuccess();
    }

    public function removeAssetCollection(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        NodeAggregateId $folderId,
        DimensionSpacePoint $dimensionSpacePoint,
    ): MutationResult {
        $folderNode = $this->findNodeByIdAndType(
            contentRepositoryId: $contentRepositoryId,
            workspaceName: $workspaceName,
            nodeAggregateId: $folderId,
            dimensionSpacePoint: $dimensionSpacePoint,
            nodeTypeName: NodeTypeName::fromString('Neos.Media:Folder'),
        );

        if (!$folderNode) {
            return MutationResult::fromError([
                $this->getLocalizedMessage(
                    'actions.deleteAssetCollection.notFound',
                    'Asset collection not found'
                )
            ]);
        }

        try {
            $this->contentRepositoryRegistry->get($contentRepositoryId)
                ->handle(TagSubtree::create(
                    $workspaceName,
                    $folderId,
                    $dimensionSpacePoint,
                    NodeVariantSelectionStrategy::STRATEGY_ALL_VARIANTS,
                    NeosSubtreeTag::removed(),
                ));
        } catch (\Throwable) {
            return MutationResult::fromError([
                $this->getLocalizedMessage(
                    'actions.deleteAssetCollection.notFound',
                    'Asset collection not found'
                )
            ]);
        }
        return MutationResult::fromSuccess([
            $this->getLocalizedMessage(
                'actions.deleteAssetCollection.success',
                'Asset collection deleted',
            )
        ]);
    }

    private function findNodeByIdAndType(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        NodeAggregateId $nodeAggregateId,
        DimensionSpacePoint $dimensionSpacePoint,
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

    private function createNode(
        ContentRepositoryId $contentRepositoryId,
        WorkspaceName $workspaceName,
        NodeTypeName $nodeTypeName,
        OriginDimensionSpacePoint $originDimensionSpacePoint,
        NodeAggregateId $parentNodeAggregateId,
        ?PropertyValuesToWrite $initialProperties = null,
        ?NodeReferencesToWrite $initialReferences = null,
    ): Node {
        $contentRepository = $this->contentRepositoryRegistry->get($contentRepositoryId);

        $nodeAggregateId = NodeAggregateId::create();
        $contentRepository->handle(
            CreateNodeAggregateWithNode::create(
                workspaceName: $workspaceName,
                nodeAggregateId: $nodeAggregateId,
                nodeTypeName: $nodeTypeName,
                originDimensionSpacePoint: $originDimensionSpacePoint,
                parentNodeAggregateId: $parentNodeAggregateId,
                initialPropertyValues: $initialProperties,
                references: $initialReferences,
            )
        );

        /** @var Node $node (otherwise the command would have failed) */
        $node = $contentRepository->getContentSubgraph($workspaceName, $originDimensionSpacePoint->toDimensionSpacePoint())
            ->findNodeById($nodeAggregateId);

        return $node;
    }

    private function setNodeProperties(Node $node, PropertyValuesToWrite $properties): Node
    {
        $subgraph = $this->contentRepositoryRegistry->subgraphForNode($node);
        $contentRepository = $this->contentRepositoryRegistry->get($node->contentRepositoryId);
        $contentRepository
            ->handle(SetNodeProperties::create(
                workspaceName: $node->workspaceName,
                nodeAggregateId: $node->aggregateId,
                originDimensionSpacePoint: $node->originDimensionSpacePoint,
                propertyValues: $properties,
            ));

        /** @var Node $node (otherwise the command would have failed) */
        $node = $subgraph->findNodeById($node->aggregateId);

        return $node;
    }

    /**
     * @throws NodeAggregateCurrentlyDoesNotExist
     */
    private function setNodeTags(Node $node, NodeAggregateIds $tagIds): Node
    {
        $subgraph = $this->contentRepositoryRegistry->subgraphForNode($node);
        $contentRepository = $this->contentRepositoryRegistry->get($node->contentRepositoryId);

        $contentRepository
            ->handle(SetNodeReferences::create(
                workspaceName: $node->workspaceName,
                sourceNodeAggregateId: $node->aggregateId,
                sourceOriginDimensionSpacePoint: $node->originDimensionSpacePoint,
                references: NodeReferencesToWrite::create(
                    NodeReferencesForName::fromReferences(
                        ReferenceName::fromString('tags'),
                        $tagIds->map(
                            fn (NodeAggregateId $nodeAggregateId): NodeReferenceToWrite => NodeReferenceToWrite::fromTarget($nodeAggregateId),
                        ),
                    ),
                )
            ));

        /** @var Node $nodeWithNewTags (otherwise the command would have failed) */
        $nodeWithNewTags = $subgraph->findNodeById($node->aggregateId);

        return $nodeWithNewTags;
    }

    private function tagNode(Node $node, NodeAggregateId $tagId): Node
    {
        $subgraph = $this->contentRepositoryRegistry->subgraphForNode($node);
        $contentRepository = $this->contentRepositoryRegistry->get($node->contentRepositoryId);

        $nodeReferencesToWrite = [];
        foreach (
            $subgraph->findReferences(
                $node->aggregateId,
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
                workspaceName: $node->workspaceName,
                sourceNodeAggregateId: $node->aggregateId,
                sourceOriginDimensionSpacePoint: $node->originDimensionSpacePoint,
                references: NodeReferencesToWrite::create(
                    NodeReferencesForName::fromReferences(
                        ReferenceName::fromString('tags'),
                        $nodeReferencesToWrite
                    ),
                )
            ));

        /** @var Node $taggedNode (otherwise the command would have failed) */
        $taggedNode = $subgraph->findNodeById($node->aggregateId);

        return $taggedNode;
    }

    private function untagNode(Node $node, NodeAggregateId $tagId): Node
    {
        $subgraph = $this->contentRepositoryRegistry->subgraphForNode($node);
        $contentRepository = $this->contentRepositoryRegistry->get($node->contentRepositoryId);

        $nodeReferencesToWrite = [];
        foreach (
            $subgraph->findReferences(
                $node->aggregateId,
                FindReferencesFilter::create(
                    referenceName: ReferenceName::fromString('tags'),
                )
            ) as $existingReference
        ) {
            if ($existingReference->node->aggregateId->equals($tagId)) {
                // do not write this reference again
                continue;
            }
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

        $contentRepository
            ->handle(SetNodeReferences::create(
                workspaceName: $node->workspaceName,
                sourceNodeAggregateId: $node->aggregateId,
                sourceOriginDimensionSpacePoint: $node->originDimensionSpacePoint,
                references: NodeReferencesToWrite::create(
                    NodeReferencesForName::fromReferences(
                        ReferenceName::fromString('tags'),
                        $nodeReferencesToWrite
                    ),
                )
            ));

        /** @var Node $untaggedNode (otherwise the command would have failed) */
        $untaggedNode = $subgraph->findNodeById($node->aggregateId);

        return $untaggedNode;
    }

    private function moveNode(Node $node, NodeAggregateId $newParent): Node
    {
        $contentRepository = $this->contentRepositoryRegistry->get($node->contentRepositoryId);

        $contentRepository
            ->handle(MoveNodeAggregate::create(
                workspaceName: $node->workspaceName,
                dimensionSpacePoint: $node->dimensionSpacePoint,
                nodeAggregateId: $node->aggregateId,
                relationDistributionStrategy: RelationDistributionStrategy::STRATEGY_GATHER_ALL,
                newParentNodeAggregateId: $newParent,
            ));

        return $node;
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

    /**
     * @param array<mixed> $arguments
     */
    private function getLocalizedMessage(string $id, string $fallback = '', array $arguments = []): MutationResponseMessage
    {
        try {
            $value = $this->translator->translateById(
                $id,
                $arguments,
                null,
                null,
                'Main',
                'Flowpack.Media.Ui'
            ) ?? $fallback;
        } catch (\Exception) {
            $value = $fallback ?: $id;
        }

        return MutationResponseMessage::fromString($value);
    }
}
