import * as React from 'react';
import AssetCollection from './AssetCollection';
import Tag from './Tag';

interface AbstractTreeNodeProps {
    title?: string;
    label?: string;
    onClick: ([string]: any) => void;
    level: number;
    isActive: boolean;
    children?: React.ReactElement[];
}

export interface AssetCollectionTreeNodeProps extends AbstractTreeNodeProps {
    assetCollection: AssetCollection;
    onClick: (assetCollection: AssetCollection) => void;
}

export interface TagTreeNodeProps extends AbstractTreeNodeProps {
    tag: Tag;
    onClick: (tag: Tag) => void;
}
