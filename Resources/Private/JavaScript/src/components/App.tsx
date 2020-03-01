import * as React from 'react';
import { createUseStyles } from 'react-jss';
import AssetList from './AssetList';
import SideBarLeft from './SideBarLeft';
import SideBarRight from './SideBarRight';
import Pagination from './Pagination';
import MediaUiThemeProvider, { useMediaUiTheme } from '../core/MediaUiThemeProvider';
import LoadingIndicator from './LoadingIndicator';
import AssetPreview from './AssetPreview';
import { useMediaUi } from '../core/MediaUi';

const useAppStyles = createUseStyles({
    container: {
        display: 'grid',
        gridTemplateColumns: '250px 1fr 250px',
        gridTemplateAreas: `
            "left main right"
            "left bottom right"
        `,
        gridGap: '1rem'
    }
});

export default function App() {
    const theme = useMediaUiTheme();
    const classes = useAppStyles({ theme });
    const { selectedAsset } = useMediaUi();

    return (
        <MediaUiThemeProvider>
            <div className={classes.container}>
                <LoadingIndicator />
                <SideBarLeft gridPosition="left" />
                {!selectedAsset && <AssetList gridPosition="main" />}
                {selectedAsset && <AssetPreview gridPosition="main" />}
                <SideBarRight gridPosition="right" />
                <Pagination />
            </div>
        </MediaUiThemeProvider>
    );
}
