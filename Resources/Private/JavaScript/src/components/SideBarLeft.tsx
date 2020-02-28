import * as React from 'react';
import { createUseStyles } from 'react-jss';
import TagList from './TagList';
import { MediaUITheme, useMediaUITheme } from './App';

const useLeftSideBarStyles = createUseStyles((theme: MediaUITheme) => ({
    container: {
        gridArea: props => props.gridPosition,
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.borderColor}`
    }
}));

export default function SideBarLeft({ gridPosition }) {
    const theme = useMediaUITheme();
    const classes = useLeftSideBarStyles({ gridPosition, theme });
    const components = [TagList];

    return (
        <div className={classes.container}>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
}
