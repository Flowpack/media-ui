import * as React from 'react';
import { createUseStyles } from 'react-jss';
import { useMediaUiTheme } from '../core/MediaUiThemeProvider';
import MediaUiTheme from '../interfaces/MediaUiTheme';

const useStyles = createUseStyles({
    container: {
        gridArea: props => props.gridPosition,
        display: 'flex',
        flexDirection: 'column',
        border: ({ theme }) => `1px solid ${theme.borderColor}`
    }
});

export default function SideBarRight(props: GridComponentProps) {
    const theme = useMediaUiTheme();
    const classes = useStyles({ ...props, theme });

    return <div className={classes.container}>Right sidebar</div>;
}
