import * as React from 'react';

import { Tree } from '@neos-project/react-ui-components';

import { AbstractTreeNodeProps } from '../../../interfaces';
import { dndTypes } from '../../../constants';
import AssetCollection from '../../../interfaces/AssetCollection';
import { useCallback } from 'react';

export interface AssetCollectionTreeNodeProps extends AbstractTreeNodeProps {
    assetCollection: AssetCollection;
    onClick: (assetCollection: AssetCollection) => void;
}

const AssetCollectionTreeNode: React.FC<AssetCollectionTreeNodeProps> = ({
    isActive,
    assetCollection,
    label,
    title,
    children,
    level,
    onClick
}: AssetCollectionTreeNodeProps) => {
    const handleClick = useCallback(() => onClick(assetCollection), [onClick, assetCollection]);
    return (
        <Tree.Node>
            <Tree.Node.Header
                isActive={isActive}
                isCollapsed={!children}
                isFocused={isActive}
                isLoading={false}
                hasError={false}
                label={label || assetCollection.title}
                title={title || assetCollection.title}
                icon="folder"
                nodeDndType={dndTypes.COLLECTION}
                level={level}
                onClick={handleClick}
                hasChildren={!!children}
            />
            {children}
        </Tree.Node>
    );
};

export default React.memo(AssetCollectionTreeNode);
