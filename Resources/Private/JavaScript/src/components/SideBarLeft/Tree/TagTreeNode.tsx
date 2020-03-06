import * as React from 'react';
import Tree from '@neos-project/react-ui-components/lib-esm/Tree';
import { TagTreeNodeProps } from '../../../interfaces';

export default function TagTreeNode(props: TagTreeNodeProps) {
    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={props.isActive}
                label={props.label || props.tag.label}
                title={props.title || props.tag.label}
                icon="tag"
                level={props.level}
                onClick={props.onClick}
                hasChildren={false}
            />
        </Tree.Node>
    );
}
