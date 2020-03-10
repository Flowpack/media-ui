import React = require('react');
import { createUseMediaUiStyles } from '../../core';
import { MediaUiTheme, GridComponentProps } from '../../interfaces';
import TypeFilter from './TypeFilter';
import SearchBox from './SearchBox';
import ViewModeSelector from './ViewModeSelector';

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

    const components = [SearchBox, TypeFilter, ViewModeSelector];

    return (
        <div className={classes.topBar}>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
}
