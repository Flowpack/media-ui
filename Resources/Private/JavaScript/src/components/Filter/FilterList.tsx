import React = require('react');
import { createUseMediaUiStyles } from '../../core/MediaUiThemeProvider';
import MediaUiTheme from '../../interfaces/MediaUiTheme';
import TypeFilter from './TypeFilter';
import SearchBox from './SearchBox';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    filterList: {
        gridArea: props => props.gridPosition,
        display: 'grid',
        gridAutoColumns: 'auto',
        gridGap: '2rem'
    }
}));

export default function FilterList(props: GridComponentProps) {
    const classes = useStyles({ ...props });

    const filterComponents = [SearchBox, TypeFilter];

    return (
        <div className={classes.filterList}>
            {filterComponents.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
}
