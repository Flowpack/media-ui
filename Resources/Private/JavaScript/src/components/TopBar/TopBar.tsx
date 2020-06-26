import * as React from 'react';

import { createUseMediaUiStyles } from '../../core';
import { MediaUiTheme } from '../../interfaces';
import { SearchBox, TypeFilter, ViewModeSelector } from './index';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    topBar: {
        display: 'grid',
        gridTemplateColumns: 'repeat( auto-fit, minmax(200px, 1fr) )',
        gridGap: theme.spacing.goldenUnit
    }
}));

export default function TopBar() {
    const classes = useStyles();

    const components = [SearchBox, TypeFilter, ViewModeSelector];

    return (
        <div className={classes.topBar}>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
}
