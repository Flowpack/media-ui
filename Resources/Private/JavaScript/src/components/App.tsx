import * as React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { SideBarLeft } from './SideBarLeft';
import SideBarRight from './SideBarRight';
import Pagination from './Pagination';
import { useMediaUi, createUseMediaUiStyles, MediaUiThemeProvider } from '../core';
import LoadingIndicator from './LoadingIndicator';
import { MediaUiTheme } from '../interfaces';
import { VIEW_MODE_SELECTION } from '../queries/ViewModeSelectionQuery';
import { TopBar, VIEW_MODES } from './TopBar';
import { ThumbnailView, ListView } from './Main';
import AssetPreview from './AssetPreview';

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

    const viewModeSelectionQuery = useQuery(VIEW_MODE_SELECTION);
    const { viewModeSelection } = viewModeSelectionQuery.data;

    return (
        <MediaUiThemeProvider>
            <div className={classes.container}>
                <LoadingIndicator />
                <SideBarLeft gridPosition="left" />
                {!selectedAsset && (
                    <>
                        <TopBar gridPosition="top" />
                        {viewModeSelection === VIEW_MODES.List ? (
                            <ListView gridPosition="main" />
                        ) : (
                            <ThumbnailView gridPosition="main" />
                        )}
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
