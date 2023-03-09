import * as React from 'react';

import { Tree } from '@neos-project/react-ui-components';

import dndTypes from '@media-ui/core/src/constants/dndTypes';
import { useSelectTag } from '@media-ui/core/src/hooks';

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
    const selectTag = useSelectTag();

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
                onClick={() => selectTag(tagId, assetCollectionId)}
                hasChildren={false}
            />
        </Tree.Node>
    );
};

export default React.memo(TagTreeNode);
