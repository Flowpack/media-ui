import * as React from 'react';
import { createUseMediaUiStyles } from '../core/MediaUiThemeProvider';
import MediaUiTheme from '../interfaces/MediaUiTheme';
import { AssetInspector, IptcMetadataInspector } from './Inspector';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    sidebarRight: {
        gridArea: props => props.gridPosition,
        display: 'flex',
        flexDirection: 'column'
    }
}));

export default function SideBarRight(props: GridComponentProps) {
    const classes = useStyles({ ...props });

    const components = [AssetInspector, IptcMetadataInspector];

    return (
        <div className={classes.sidebarRight}>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
}
