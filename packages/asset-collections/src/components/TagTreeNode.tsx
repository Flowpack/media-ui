import React from 'react';
import { selectorFamily, useRecoilValue, useSetRecoilState } from 'recoil';

import { Tree } from '@neos-project/react-ui-components';

import dndTypes from '@media-ui/core/src/constants/dndTypes';
import { selectedAssetCollectionAndTagState } from '@media-ui/core/src/state';
import { selectedAssetCollectionIdState } from '@media-ui/feature-asset-collections';
import { selectedTagIdState } from '@media-ui/feature-asset-tags';
import { selectedAssetSourceIdState } from '@media-ui/feature-asset-sources';

export interface TagTreeNodeProps extends TreeNodeProps {
    tagId: string;
    label: string;
    assetCollectionId?: string;
    level: number;
    icon?: string;
    customIconComponent?: React.ReactNode;
}

// This state selector provides the focused state for each individual asset collection
const tagFocusedState = selectorFamily<
    boolean,
    { assetCollectionId: string; tagId: string; assetSourceId: AssetSourceId }
>({
    key: 'TagFocusedState',
    get:
        ({ assetCollectionId, tagId, assetSourceId }) =>
        ({ get }) =>
            get(selectedAssetCollectionIdState(assetSourceId)) === assetCollectionId &&
            get(selectedTagIdState(assetSourceId)) === tagId,
});

const TagTreeNode: React.FC<TagTreeNodeProps> = ({
    tagId,
    assetCollectionId,
    label,
    level,
    icon = 'tag',
    customIconComponent,
}: TagTreeNodeProps) => {
    const assetSourceId = useRecoilValue(selectedAssetSourceIdState);
    const selectAssetCollectionAndTag = useSetRecoilState(selectedAssetCollectionAndTagState(assetSourceId));
    const isFocused = useRecoilValue(tagFocusedState({ assetCollectionId, tagId, assetSourceId }));

    return (
        <Tree.Node className="TagTreeNode">
            <Tree.Node.Header
                isActive={isFocused}
                isCollapsed={true}
                isFocused={isFocused}
                isLoading={false}
                hasError={false}
                label={label}
                title={label}
                icon={icon}
                customIconComponent={customIconComponent}
                nodeDndType={dndTypes.TAG}
                dragForbidden={true}
                level={level}
                onClick={() => selectAssetCollectionAndTag({ tagId, assetCollectionId })}
                hasChildren={false}
            />
        </Tree.Node>
    );
};

export default React.memo(TagTreeNode);
