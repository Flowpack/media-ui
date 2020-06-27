import * as React from 'react';

import { Tree } from '@neos-project/react-ui-components';

import { AbstractTreeNodeProps } from '../../../interfaces';
import { dndTypes } from '../../../constants';
import AssetCollection from '../../../interfaces/AssetCollection';

export interface AssetCollectionTreeNodeProps extends AbstractTreeNodeProps {
    assetCollection: AssetCollection;
    onClick: (assetCollection: AssetCollection) => void;
}

export default function AssetCollectionTreeNode(props: AssetCollectionTreeNodeProps) {
    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={props.isActive}
                isCollapsed={!props.children}
                isFocused={props.isActive}
                isLoading={false}
                hasError={false}
                label={props.label || props.assetCollection.title}
                title={props.title || props.assetCollection.title}
                icon="folder"
                nodeDndType={dndTypes.COLLECTION}
                level={props.level}
                onClick={() => props.onClick(props.assetCollection)}
                hasChildren={!!props.children}
            />
            {props.children}
        </Tree.Node>
    );
}
