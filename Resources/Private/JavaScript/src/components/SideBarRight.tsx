import * as React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import { MediaUITheme, useMediaUITheme } from './App';

const useRightSideBarStyles = createUseStyles((theme: MediaUITheme) => ({
    container: {
        gridArea: props => props.gridPosition,
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.borderColor}`
    }
}));

export default function SideBarRight({ gridPosition }) {
    const theme = useMediaUITheme();
    const classes = useRightSideBarStyles({ gridPosition, theme });

    return <div className={classes.container}>Right sidebar</div>;
}
