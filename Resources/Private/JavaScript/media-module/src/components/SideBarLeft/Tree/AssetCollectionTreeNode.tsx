import * as React from 'react';
import { useMemo, useState } from 'react';

import { Tree } from '@neos-project/react-ui-components';

import dndTypes from '@media-ui/core/src/constants/dndTypes';
import { useSelectAssetCollection } from '@media-ui/core/src/hooks';
import {
    useAssetCollectionQuery,
    useAssetCollectionsQuery,
    useSelectedAssetCollection,
} from '@media-ui/feature-asset-collections';
import { useSelectedTag, useTagsQuery } from '@media-ui/feature-asset-tags';

import TreeNodeProps from './TreeNodeProps';
import TagTreeNode from './TagTreeNode';

export interface AssetCollectionTreeNodeProps extends TreeNodeProps {
    assetCollectionId: string | null;
}

const AssetCollectionTreeNode: React.FC<AssetCollectionTreeNodeProps> = ({
    assetCollectionId,
    label = 'n/a',
    title = 'n/a',
    level,
    collapsedByDefault = true,
}: AssetCollectionTreeNodeProps) => {
    const [collapsed, setCollapsed] = useState(collapsedByDefault);
    const { assetCollection } = useAssetCollectionQuery(assetCollectionId);
    const selectedTag = useSelectedTag();
    const { tags } = useTagsQuery();
    const selectedAssetCollection = useSelectedAssetCollection();
    const { assetCollections } = useAssetCollectionsQuery();
    const selectAssetCollection = useSelectAssetCollection();
    const childCollections = useMemo(() => {
        return assetCollectionId
            ? assetCollections.filter((collection) => collection.parent?.id === assetCollectionId)
            : [];
    }, [assetCollections, assetCollectionId]);

    const isFocused =
        (assetCollection === null && selectedAssetCollection === null && selectedTag === null) ||
        selectedAssetCollection?.id === assetCollection?.id;
    const isActive = isFocused; // TODO: Also set active when a child collection is focused

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={isActive}
                isFocused={isFocused}
                isLoading={false}
                hasError={false}
                label={assetCollection?.title || label}
                title={assetCollection?.title || title}
                icon={isActive ? 'folder-open' : 'folder'}
                nodeDndType={dndTypes.COLLECTION}
                level={level}
                onToggle={() => setCollapsed(!collapsed)}
                onClick={() => selectAssetCollection(assetCollection)}
                isCollapsed={childCollections.length === 0 || collapsed}
                hasChildren={childCollections.length > 0}
            />
            {!collapsed &&
                childCollections.map((childCollection) => (
                    <AssetCollectionTreeNode
                        key={childCollection.id}
                        assetCollectionId={childCollection.id}
                        level={level + 1}
                    />
                ))}
            {!collapsed &&
                (assetCollection ? assetCollection.tags : tags)?.map((tag) => (
                    <TagTreeNode
                        key={tag.id}
                        tagId={tag.id}
                        label={tag.label}
                        assetCollectionId={assetCollectionId}
                        isFocused={assetCollection?.id == selectedAssetCollection?.id && tag.id == selectedTag?.id}
                        level={level + 1}
                    />
                ))}
        </Tree.Node>
    );
};

export default React.memo(AssetCollectionTreeNode);
