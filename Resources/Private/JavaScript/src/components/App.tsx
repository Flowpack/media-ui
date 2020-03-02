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

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    container: {
        display: 'grid',
        gridTemplateColumns: '250px 1fr 250px',
        gridTemplateAreas: `
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
                {!selectedAsset && (
                    <>
                        <SideBarLeft gridPosition="left" />
                        <AssetList gridPosition="main" />
                        <SideBarRight gridPosition="right" />
                        <Pagination />
                    </>
                )}
                {selectedAsset && (
                    <>
                        <AssetPreview gridPosition="main" />
                    </>
                )}
            </div>
        </MediaUiThemeProvider>
    );
}
