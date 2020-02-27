import * as React from 'react';
import { createUseStyles } from 'react-jss';
import TagList from './TagList';

const useLeftSideBarStyles = createUseStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid gray'
    }
});

export default function SideBarLeft() {
    const classes = useLeftSideBarStyles();
    const components = [TagList];

    return (
        <div className={classes.container}>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
}
