import * as React from 'react';

import { Tree } from '@neos-project/react-ui-components';

import { AbstractTreeNodeProps, AssetCollection } from '../../../interfaces';
import { dndTypes } from '../../../constants';
import Tag from '../../../interfaces/Tag';
import { useCallback } from 'react';

export interface TagTreeNodeProps extends AbstractTreeNodeProps {
    tag: Tag;
    assetCollection?: AssetCollection;
    onClick: (tag: Tag, assetCollection?: AssetCollection) => void;
}

const TagTreeNode: React.FC<TagTreeNodeProps> = ({
    tag,
    isActive,
    assetCollection,
    label,
    title,
    onClick,
    level,
}: TagTreeNodeProps) => {
    const handleClick = useCallback(() => onClick(tag, assetCollection), [onClick, tag, assetCollection]);

    // TODO: Adjust rendering for nested tags
    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={isActive}
                isCollapsed={true}
                isFocused={isActive}
                isLoading={false}
                hasError={false}
                label={label || tag.label}
                title={title || tag.label}
                icon="tag"
                nodeDndType={dndTypes.TAG}
                level={level}
                onClick={handleClick}
                hasChildren={!!tag.children?.length}
            />
        </Tree.Node>
    );
};

export default React.memo(TagTreeNode);
