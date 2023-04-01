import React, { useCallback } from 'react';
import { atom, selectorFamily, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { Tree } from '@neos-project/react-ui-components';

import dndTypes from '@media-ui/core/src/constants/dndTypes';
import { selectedAssetCollectionAndTagState, localStorageEffect } from '@media-ui/core/src/state';
import { IconStack } from '@media-ui/core/src/components';

import TreeNodeProps from '../interfaces/TreeNodeProps';
import TagTreeNode from './TagTreeNode';
import selectedAssetCollectionIdState from '../state/selectedAssetCollectionIdState';
import { assetCollectionFavouriteState } from '../state/assetCollectionFavouritesState';
import useAssetCollectionQuery from '../hooks/useAssetCollectionQuery';

import { selectedTagIdState } from '@media-ui/feature-asset-tags';

export interface AssetCollectionTreeNodeProps extends TreeNodeProps {
    assetCollectionId: string | null;
    renderChildCollections?: boolean;
    children?: React.ReactNode;
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
                if (newState[assetCollectionId] === true) {
                    delete newState[assetCollectionId];
                }
                return newState;
            }),
});

// This state selector provides the focused state for each individual asset collection
const assetCollectionFocusedState = selectorFamily<boolean, string>({
    key: 'AssetCollectionFocusedState',
    get:
        (assetCollectionId) =>
        ({ get }) =>
            get(selectedAssetCollectionIdState) === assetCollectionId,
});

// This state selector provides the focused state for each individual asset collection
const assetCollectionActiveState = selectorFamily<boolean, string[]>({
    key: 'AssetCollectionActiveState',
    get:
        (tags) =>
        ({ get }) =>
            tags.includes(get(selectedTagIdState)),
});

const AssetCollectionTreeNode: React.FC<AssetCollectionTreeNodeProps> = ({
    assetCollectionId,
    label = 'n/a',
    title = 'n/a',
    level,
    children = null,
    renderChildCollections = true,
}) => {
    const { assetCollection } = useAssetCollectionQuery(assetCollectionId);
    const [collapsed, setCollapsed] = useRecoilState(assetCollectionTreeCollapsedProxyState(assetCollectionId));
    const selectAssetCollectionAndTag = useSetRecoilState(selectedAssetCollectionAndTagState);
    const isFocused = useRecoilValue(assetCollectionFocusedState(assetCollectionId));
    const isFavourite = useRecoilValue(assetCollectionFavouriteState(assetCollectionId));
    const isActive = useRecoilValue(assetCollectionActiveState(assetCollection?.tags.map((tag) => tag.id) || []));

    const handleClick = useCallback(() => {
        selectAssetCollectionAndTag({ assetCollectionId, tagId: null });
        setCollapsed(false);
    }, [assetCollectionId, selectAssetCollectionAndTag, setCollapsed]);

    const CollectionIcon = (
        <IconStack
            primaryIcon={
                !assetCollectionId
                    ? 'globe'
                    : !collapsed && (assetCollection?.tags.length > 0 || assetCollection?.children.length > 0)
                    ? 'folder-open'
                    : 'folder'
            }
            secondaryIcon={isFavourite ? 'star' : undefined}
        />
    );

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={isActive || isFocused}
                isFocused={isFocused && !isActive}
                isLoading={false}
                hasError={false}
                label={assetCollection?.title || label}
                title={assetCollection?.title || title}
                customIconComponent={CollectionIcon}
                nodeDndType={dndTypes.COLLECTION}
                level={level}
                onToggle={() => setCollapsed(!collapsed)}
                onClick={handleClick}
                isCollapsed={
                    (assetCollection?.tags.length === 0 && assetCollection?.children.length === 0) || collapsed
                }
                hasChildren={
                    children !== null ||
                    assetCollection?.tags.length > 0 ||
                    (renderChildCollections && assetCollection?.children.length > 0)
                }
            />
            {!collapsed && assetCollection && (
                <>
                    {renderChildCollections &&
                        assetCollection.children?.map((childCollection) => (
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
