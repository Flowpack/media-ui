import * as React from 'react';

import { createUseMediaUiStyles } from '../../core';
import { AssetCollectionTree } from './Tree';
import { AssetSourceList, AssetSourceDescription } from './index';
import { MediaUiTheme, GridComponentProps } from '../../interfaces';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    leftSideBar: {
        gridArea: props => props.gridPosition,
        display: 'grid',
        gridAutoRows: 'min-content',
        gridGap: theme.spacing.full
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
