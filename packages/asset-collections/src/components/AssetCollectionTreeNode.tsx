import React, { useCallback, useMemo } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { Tree } from '@neos-project/react-ui-components';

import dndTypes from '@media-ui/core/src/constants/dndTypes';
import { selectedAssetCollectionAndTagState } from '@media-ui/core/src/state';
import { IconStack } from '@media-ui/core/src/components';
import { useConfigQuery } from '@media-ui/core/src/hooks';

import TagTreeNode from './TagTreeNode';
import { useAssetCollectionQuery, UNASSIGNED_COLLECTION_ID } from '../hooks/useAssetCollectionQuery';
import useAssetCollectionsQuery from '../hooks/useAssetCollectionsQuery';
import { assetCollectionFavouriteState } from '../state/assetCollectionFavouritesState';
import { assetCollectionTreeCollapsedItemState } from '../state/assetCollectionTreeCollapsedState';
import { assetCollectionFocusedState } from '../state/assetCollectionFocusedState';
import { assetCollectionActiveState } from '../state/assetCollectionActiveState';
import { useAssetCollectionDnd } from '../provider/AssetCollectionTreeDndProvider';

export interface AssetCollectionTreeNodeProps extends TreeNodeProps {
    assetCollectionId?: AssetCollectionId;
    renderChildCollections?: boolean;
    children?: React.ReactNode;
}

const AssetCollectionTreeNode: React.FC<AssetCollectionTreeNodeProps> = ({
    assetCollectionId,
    label = 'n/a',
    title = 'n/a',
    level,
    children = null,
    renderChildCollections = true,
}) => {
    const { config } = useConfigQuery();
    const { assetCollection } = useAssetCollectionQuery(assetCollectionId);
    const { assetCollections } = useAssetCollectionsQuery();
    const [collapsed, setCollapsed] = useRecoilState(assetCollectionTreeCollapsedItemState(assetCollectionId));
    const selectAssetCollectionAndTag = useSetRecoilState(selectedAssetCollectionAndTagState);
    const isFocused = useRecoilValue(assetCollectionFocusedState(assetCollectionId));
    const isFavourite = useRecoilValue(assetCollectionFavouriteState(assetCollectionId));
    const isActive = useRecoilValue(assetCollectionActiveState(assetCollectionId));

    const { currentlyDraggedNodes, handeEndDrag, handleDrag, handleDrop, acceptsDraggedNode } = useAssetCollectionDnd();

    const handleClick = useCallback(() => {
        selectAssetCollectionAndTag({ assetCollectionId, tagId: null });
        setCollapsed(false);
    }, [assetCollectionId, selectAssetCollectionAndTag, setCollapsed]);

    // Drag & drop specifics
    const accepts = useCallback(
        (mode) => acceptsDraggedNode(assetCollectionId, mode),
        [assetCollectionId, acceptsDraggedNode]
    );
    const handleNodeDrag = useCallback(() => handleDrag(assetCollectionId), [assetCollectionId, handleDrag]);
    const handleNodeEndDrag = useCallback(() => handeEndDrag(), [handeEndDrag]);
    const handleNodeDrop = useCallback(
        (position) => handleDrop(assetCollectionId, position),
        [assetCollectionId, handleDrop]
    );

    const childCollectionIds = useMemo(() => {
        return (
            assetCollections
                ?.filter((assetCollection) => (assetCollection.parent?.id || null) == assetCollectionId)
                .map(({ id }) => id) || []
        );
    }, [assetCollectionId, assetCollections]);

    const CollectionIcon =
        assetCollectionId === UNASSIGNED_COLLECTION_ID ? (
            <IconStack primaryIcon="folder" secondaryIcon="times" />
        ) : (
            <IconStack
                primaryIcon={
                    !assetCollectionId
                        ? 'globe'
                        : !collapsed && (assetCollection?.tags.length > 0 || childCollectionIds.length > 0)
                        ? 'folder-open'
                        : 'folder'
                }
                secondaryIcon={isFavourite ? 'star' : undefined}
            />
        );

    // TODO: Also check assetSource.readonly
    const dragForbidden =
        !config.canManageAssetCollections || !assetCollectionId || assetCollectionId === UNASSIGNED_COLLECTION_ID;

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={isActive || isFocused}
                isFocused={isFocused && !isActive}
                isLoading={false}
                hasError={false}
                label={
                    (assetCollection?.title || label) +
                    (assetCollection?.assetCount >= 0 ? ` (${assetCollection?.assetCount})` : '')
                }
                title={assetCollection?.title || title}
                isHiddenInIndex={assetCollection?.assetCount === 0}
                customIconComponent={CollectionIcon}
                nodeDndType={dndTypes.COLLECTION}
                isDragging={currentlyDraggedNodes.includes(assetCollectionId)}
                dragAndDropContext={{
                    onDrag: handleNodeDrag,
                    onEndDrag: handleNodeEndDrag,
                    onDrop: handleNodeDrop,
                    accepts,
                }}
                dragForbidden={dragForbidden}
                level={level}
                onToggle={() => setCollapsed(!collapsed)}
                onClick={handleClick}
                isCollapsed={(assetCollection?.tags.length === 0 && childCollectionIds.length === 0) || collapsed}
                hasChildren={
                    children !== null ||
                    assetCollection?.tags.length > 0 ||
                    (renderChildCollections && childCollectionIds.length > 0)
                }
            />
            {!collapsed && assetCollection && (
                <>
                    {renderChildCollections &&
                        childCollectionIds.map((childCollectionId) => (
                            <AssetCollectionTreeNode
                                key={childCollectionId}
                                assetCollectionId={childCollectionId}
                                level={level + 1}
                            />
                        ))}
                    {assetCollection.tags?.map((tag) => (
                        <TagTreeNode
                            key={tag.id}
                            tagId={tag.id}
                            label={tag.label}
                            assetCollectionId={assetCollectionId}
                            level={level + 1}
                        />
                    ))}
                </>
            )}
            {!collapsed && children}
        </Tree.Node>
    );
};

export default React.memo(AssetCollectionTreeNode);
