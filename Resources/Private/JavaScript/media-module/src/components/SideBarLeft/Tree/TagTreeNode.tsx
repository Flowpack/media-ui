import * as React from 'react';
import { useSetRecoilState } from 'recoil';

import { Tree } from '@neos-project/react-ui-components';

import dndTypes from '@media-ui/core/src/constants/dndTypes';
import { selectedAssetCollectionAndTagState } from '@media-ui/core/src/state';

import TreeNodeProps from './TreeNodeProps';

export interface TagTreeNodeProps extends TreeNodeProps {
    tagId: string;
    label: string;
    isFocused: boolean;
    assetCollectionId?: string;
    level: number;
}

const TagTreeNode: React.FC<TagTreeNodeProps> = ({
    tagId,
    isFocused,
    assetCollectionId,
    label,
    level,
}: TagTreeNodeProps) => {
    const selectAssetCollectionAndTag = useSetRecoilState(selectedAssetCollectionAndTagState);

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
