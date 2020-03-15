import * as React from 'react';
import { createUseMediaUiStyles } from '../../core';
import { MediaUiTheme, GridComponentProps } from '../../interfaces';
import { ImportedFilter, ViewModeSelector, SearchBox, TypeFilter } from '.';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    topBar: {
        gridArea: props => props.gridPosition,
        display: 'grid',
        gridTemplateColumns: 'repeat( auto-fit, minmax(200px, 1fr) )',
        gridGap: '2rem'
    }
}));

export default function TopBar(props: GridComponentProps) {
    const classes = useStyles({ ...props });

    const components = [SearchBox, TypeFilter, ViewModeSelector, ImportedFilter];

    return (
        <div className={classes.topBar}>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
}
