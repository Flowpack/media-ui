import React, { useCallback } from 'react';
import { atom, selectorFamily, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { Tree } from '@neos-project/react-ui-components';

import dndTypes from '@media-ui/core/src/constants/dndTypes';
import { selectedAssetCollectionAndTagState } from '@media-ui/core/src/state';
import { localStorageEffect } from '@media-ui/media-module/src/core/PersistentStateManager';
import { selectedAssetCollectionIdState, useAssetCollectionQuery } from '@media-ui/feature-asset-collections';

import TreeNodeProps from '../interfaces/TreeNodeProps';
import TagTreeNode from './TagTreeNode';

export interface AssetCollectionTreeNodeProps extends TreeNodeProps {
    assetCollectionId: string | null;
    children?: React.ReactElement[];
}

const assetCollectionTreeCollapsedState = atom<Record<string, boolean>>({
    key: 'AssetCollectionTreeState',
    default: {},
    effects: [localStorageEffect('AssetCollectionTreeState')],
});

const assetCollectionTreeCollapsedProxyState = selectorFamily<boolean, string>({
    key: 'AssetCollectionTreeCollapsedProxyState',
    get:
        (assetCollectionId) =>
        ({ get }) =>
            get(assetCollectionTreeCollapsedState)[assetCollectionId] ?? true,
    set:
        (assetCollectionId) =>
        ({ set }, newValue: boolean) =>
            set(assetCollectionTreeCollapsedState, (prevState) => {
                const newState = {
                    ...prevState,
                    [assetCollectionId]: newValue,
                };
                // TODO: Filter true value as we don't need to store them
                if (newState[assetCollectionId] === true) {
                    delete newState[assetCollectionId];
                }
                return newState;
            }),
});

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
    children = null,
}: AssetCollectionTreeNodeProps) => {
    const { assetCollection } = useAssetCollectionQuery(assetCollectionId);
    const [collapsed, setCollapsed] = useRecoilState(assetCollectionTreeCollapsedProxyState(assetCollectionId));
    const selectAssetCollectionAndTag = useSetRecoilState(selectedAssetCollectionAndTagState);
    const isFocused = useRecoilValue(assetCollectionFocusedState(assetCollectionId));
    // const isActive = isFocused; // TODO: Implement active state when a child collection is focused

    const handleClick = useCallback(() => {
        selectAssetCollectionAndTag({ assetCollectionId, tagId: null });
        setCollapsed(false);
    }, [assetCollectionId, selectAssetCollectionAndTag, setCollapsed]);

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={isFocused}
                isFocused={isFocused}
                isLoading={false}
                hasError={false}
                label={assetCollection?.title || label}
                title={assetCollection?.title || title}
                icon={!collapsed ? 'folder-open' : 'folder'}
                nodeDndType={dndTypes.COLLECTION}
                level={level}
                onToggle={() => setCollapsed(!collapsed)}
                onClick={handleClick}
                isCollapsed={assetCollection?.children.length === 0 || collapsed}
                hasChildren={children !== null || assetCollection?.children.length > 0}
            />
            {!collapsed && assetCollection && (
                <>
                    {assetCollection.children?.map((childCollection) => (
                        <AssetCollectionTreeNode
                            key={childCollection.id}
                            assetCollectionId={childCollection.id}
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
