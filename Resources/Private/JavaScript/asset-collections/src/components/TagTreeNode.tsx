import * as React from 'react';
import { selectorFamily, useRecoilValue, useSetRecoilState } from 'recoil';

import { Tree } from '@neos-project/react-ui-components';

import dndTypes from '@media-ui/core/src/constants/dndTypes';
import { selectedAssetCollectionAndTagState } from '@media-ui/core/src/state';
import { selectedAssetCollectionIdState } from '@media-ui/feature-asset-collections';
import { selectedTagIdState } from '@media-ui/feature-asset-tags';

import TreeNodeProps from '../interfaces/TreeNodeProps';

export interface TagTreeNodeProps extends TreeNodeProps {
    tagId: string;
    label: string;
    assetCollectionId?: string;
    level: number;
}

// This state selector provides the focused state for each individual asset collection
const tagFocusedState = selectorFamily<boolean, { assetCollectionId: string; tagId: string }>({
    key: 'TagFocusedState',
    get:
        ({ assetCollectionId, tagId }) =>
        ({ get }) =>
            get(selectedAssetCollectionIdState) === assetCollectionId && get(selectedTagIdState) === tagId,
});

const TagTreeNode: React.FC<TagTreeNodeProps> = ({ tagId, assetCollectionId, label, level }: TagTreeNodeProps) => {
    const selectAssetCollectionAndTag = useSetRecoilState(selectedAssetCollectionAndTagState);
    const isFocused = useRecoilValue(tagFocusedState({ assetCollectionId, tagId }));

    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={isFocused}
                isCollapsed={true}
                isFocused={isFocused}
                isLoading={false}
                hasError={false}
                label={label}
                title={label}
                icon="tag"
                nodeDndType={dndTypes.TAG}
                level={level}
                onClick={() => selectAssetCollectionAndTag({ tagId, assetCollectionId })}
                hasChildren={false}
            />
        </Tree.Node>
    );
};

export default React.memo(TagTreeNode);