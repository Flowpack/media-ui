import * as React from 'react';

import { createUseMediaUiStyles } from '../../core';
import { AssetCollectionTree } from './Tree';
import { AssetSourceList, AssetSourceDescription, UploadButton } from './index';
import { MediaUiTheme, GridComponentProps } from '../../interfaces';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    leftSideBar: {
        gridArea: props => props.gridPosition,
        display: 'grid',
        gridAutoRows: 'min-content',
        gridGap: theme.spacing.full,
        marginBottom: theme.spacing.full,
        overflowY: 'auto'
    }
}));

export default function SideBarLeft(props: GridComponentProps) {
    const classes = useStyles({ ...props });
    const components = [UploadButton, AssetSourceList, AssetCollectionTree, AssetSourceDescription];

    return (
        <div className={classes.leftSideBar}>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
}
