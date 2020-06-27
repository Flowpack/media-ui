import * as React from 'react';

import { Tree } from '@neos-project/react-ui-components';

import { AbstractTreeNodeProps, AssetCollection } from '../../../interfaces';
import { dndTypes } from '../../../constants';
import Tag from '../../../interfaces/Tag';

export interface TagTreeNodeProps extends AbstractTreeNodeProps {
    tag: Tag;
    assetCollection?: AssetCollection;
    onClick: (tag: Tag, assetCollection?: AssetCollection) => void;
}

export default function TagTreeNode(props: TagTreeNodeProps) {
    // TODO: Adjust props when nested tags are supported
    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={props.isActive}
                isCollapsed={true}
                isFocused={props.isActive}
                isLoading={false}
                hasError={false}
                label={props.label || props.tag.label}
                title={props.title || props.tag.label}
                icon="tag"
                nodeDndType={dndTypes.TAG}
                level={props.level}
                onClick={() => props.onClick(props.tag, props.assetCollection)}
                hasChildren={false}
            />
        </Tree.Node>
    );
}
