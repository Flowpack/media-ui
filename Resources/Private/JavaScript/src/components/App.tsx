import * as React from 'react';
import AssetList from './AssetList';
import SideBarLeft from './SideBarLeft';
import SideBarRight from './SideBarRight';
import Pagination from './Pagination';
import MediaUiThemeProvider, { createUseMediaUiStyles } from '../core/MediaUiThemeProvider';
import LoadingIndicator from './LoadingIndicator';
import AssetPreview from './AssetPreview';
import { useMediaUi } from '../core/MediaUi';
import MediaUiTheme from '../interfaces/MediaUiTheme';
import FilterList from './Filter/FilterList';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    container: {
        display: 'grid',
        gridTemplateColumns: '250px 1fr 250px',
        gridTemplateAreas: `
            "left top right"
            "left main right"
            "left bottom right"
        `,
        gridGap: '1rem'
    }
}));

export default function App() {
    const classes = useStyles();
    const { selectedAsset } = useMediaUi();

    return (
        <MediaUiThemeProvider>
            <div className={classes.container}>
                <LoadingIndicator />
                <SideBarLeft gridPosition="left" />
                {!selectedAsset && (
                    <>
                        <FilterList gridPosition="top" />
                        <AssetList gridPosition="main" />
                        <Pagination />
                    </>
                )}
                {selectedAsset && (
                    <>
                        <AssetPreview gridPosition="main" />
                    </>
                )}
                <SideBarRight gridPosition="right" />
            </div>
        </MediaUiThemeProvider>
    );
}
