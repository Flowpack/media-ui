import * as React from 'react';

import { createUseMediaUiStyles } from '../../core';
import { AssetCollectionTree } from './Tree';
import AssetSourceList from './AssetSourceList';
import { MediaUiTheme, GridComponentProps } from '../../interfaces';
import AssetSourceDescription from './AssetSourceDescription';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    leftSideBar: {
        gridArea: props => props.gridPosition,
        display: 'grid',
        gridAutoRows: 'min-content',
        gridGap: '2rem'
    }
}));

export default function SideBarLeft(props: GridComponentProps) {
    const classes = useStyles({ ...props });
    const components = [AssetSourceList, AssetCollectionTree, AssetSourceDescription];

    return (
        <div className={classes.leftSideBar}>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
}
