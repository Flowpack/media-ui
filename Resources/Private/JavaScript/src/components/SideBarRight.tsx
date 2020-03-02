import * as React from 'react';
import { createUseMediaUiStyles } from '../core/MediaUiThemeProvider';
import MediaUiTheme from '../interfaces/MediaUiTheme';
import AssetInspector from './AssetInspector';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    sidebarRight: {
        gridArea: props => props.gridPosition,
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.borderColor}`
    }
}));

export default function SideBarRight(props: GridComponentProps) {
    const classes = useStyles({ ...props });

    return (
        <div className={classes.sidebarRight}>
            <AssetInspector />
        </div>
    );
}
