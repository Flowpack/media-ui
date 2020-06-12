import * as React from 'react';
import { createUseMediaUiStyles } from '../../core';
import { GridComponentProps, MediaUiTheme } from '../../interfaces';
import { AssetInspector, IptcMetadataInspector } from './Inspector';
import CurrentSelection from './CurrentSelection';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    sidebarRight: {
        gridArea: props => props.gridPosition,
        display: 'flex',
        flexDirection: 'column',
        marginBottom: theme.spacing.full,
        overflowY: 'auto'
    }
}));

export default function SideBarRight(props: GridComponentProps) {
    const classes = useStyles({ ...props });

    const components = [CurrentSelection, AssetInspector, IptcMetadataInspector];

    return (
        <div className={classes.sidebarRight}>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
}
