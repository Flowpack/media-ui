import React, { useState } from 'react';
import { selectorFamily, useRecoilValue, useSetRecoilState } from 'recoil';

import { Tree } from '@neos-project/react-ui-components';

import dndTypes from '@media-ui/core/src/constants/dndTypes';
import { selectedAssetCollectionAndTagState } from '@media-ui/core/src/state';
import { selectedAssetCollectionIdState, useAssetCollectionQuery } from '@media-ui/feature-asset-collections';

import TreeNodeProps from './TreeNodeProps';

export interface AssetCollectionTreeNodeProps extends TreeNodeProps {
    assetCollectionId: string | null;
}

// This state selector provides the focused state for each individual asset collection
const assetCollectionFocusedState = selectorFamily<boolean, string>({
    key: 'AssetCollectionSelection',
    get:
        (assetCollectionId) =>
        ({ get }) =>
            get(selectedAssetCollectionIdState) === assetCollectionId,
});

const AssetCollectionTreeNode: React.FC<AssetCollectionTreeNodeProps> = ({
    assetCollectionId,
    label = 'n/a',
    title = 'n/a',
    level,
    collapsedByDefault = true,
}: AssetCollectionTreeNodeProps) => {
    const [collapsed, setCollapsed] = useState(collapsedByDefault);
    const { assetCollection } = useAssetCollectionQuery(assetCollectionId);
    const selectAssetCollectionAndTag = useSetRecoilState(selectedAssetCollectionAndTagState);

    const isFocused = useRecoilValue(assetCollectionFocusedState(assetCollectionId));
    const isActive = isFocused; // TODO: Implement active state when a child collection is focused

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={isActive}
                isFocused={isFocused}
                isLoading={false}
                hasError={false}
                label={assetCollection?.title || label}
                title={assetCollection?.title || title}
                icon={!collapsed ? 'folder-open' : 'folder'}
                nodeDndType={dndTypes.COLLECTION}
                level={level}
                onToggle={() => setCollapsed(!collapsed)}
                onClick={() => selectAssetCollectionAndTag({ assetCollectionId: assetCollection?.id, tagId: null })}
                isCollapsed={assetCollection?.children.length === 0 || collapsed}
                hasChildren={assetCollection?.children.length > 0}
            />
            {!collapsed &&
                assetCollection?.children.map((childCollection) => (
                    <AssetCollectionTreeNode
                        key={childCollection.id}
                        assetCollectionId={childCollection.id}
                        level={level + 1}
                    />
                ))}
        </Tree.Node>
    );
};

export default React.memo(AssetCollectionTreeNode);
