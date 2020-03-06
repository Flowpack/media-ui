import * as React from 'react';
import Tree from '@neos-project/react-ui-components/lib-esm/Tree';
import { AssetCollectionTreeNodeProps } from '../../../interfaces';

export default function AssetCollectionTreeNode(props: AssetCollectionTreeNodeProps) {
    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={props.isActive}
                label={props.label || props.assetCollection.title}
                title={props.title || props.assetCollection.title}
                icon="folder"
                level={props.level}
                onClick={props.onClick}
                hasChildren={!!props.children}
            />
            {props.children}
        </Tree.Node>
    );
}
