import * as React from 'react';
import { createUseMediaUiStyles } from '../core/MediaUiThemeProvider';
import TagList from './TagList';
import AssetCollectionList from './AssetCollectionList';
import AssetSourceList from './AssetSourceList';
import SearchBox from './SearchBox';
import MediaUiTheme from '../interfaces/MediaUiTheme';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    leftSideBar: {
        gridArea: props => props.gridPosition,
        display: 'grid',
        gridAutoRows: 'min-content',
        gridGap: '2rem'
    }
}));

export default function SideBarLeft(props: GridComponentProps) {
    const classes = useStyles({ props });
    const components = [SearchBox, AssetSourceList, AssetCollectionList, TagList];

    return (
        <div className={classes.leftSideBar}>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
}
