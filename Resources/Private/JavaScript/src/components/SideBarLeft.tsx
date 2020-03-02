import * as React from 'react';
import { createUseStyles } from 'react-jss';
import { useMediaUiTheme } from '../core/MediaUiThemeProvider';
import TagList from './TagList';
import AssetCollectionList from './AssetCollectionList';
import AssetSourceList from './AssetSourceList';
import SearchBox from './SearchBox';

const useStyles = createUseStyles({
    leftSideBar: {
        gridArea: props => props.gridPosition,
        display: 'grid',
        gridAutoRows: 'min-content',
        gridGap: '2rem'
    }
});

export default function SideBarLeft(props: GridComponentProps) {
    const theme = useMediaUiTheme();
    const classes = useStyles({ ...props, theme });
    const components = [SearchBox, AssetSourceList, AssetCollectionList, TagList];

    return (
        <div className={classes.leftSideBar}>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
}
