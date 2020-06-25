import * as React from 'react';
import { useQuery } from '@apollo/react-hooks';

import { SideBarLeft, UploadDialog } from './SideBarLeft';
import { SideBarRight } from './SideBarRight';
import Pagination from './Pagination';
import { useMediaUi, createUseMediaUiStyles } from '../core';
import LoadingIndicator from './LoadingIndicator';
import { MediaUiTheme } from '../interfaces';
import { VIEW_MODE_SELECTION } from '../queries';
import { TopBar } from './TopBar';
import { ThumbnailView, ListView } from './Main';
import { VIEW_MODES } from '../hooks';
import AssetPreview from './AssetPreview';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    container: ({ selectionMode }) => ({
        display: 'grid',
        // TODO: Find a way to not calculate height to allow scrolling in main grid area
        height: `calc(100vh - 40px * 4 - 21px)`,
        gridTemplateRows: 'auto 1fr',
        gridTemplateColumns: selectionMode
            ? theme.size.sidebarWidth + ' 1fr'
            : theme.size.sidebarWidth + ' 1fr ' + theme.size.sidebarWidth,
        gridTemplateAreas: selectionMode
            ? `
            "left top"
            "left main"
        `
            : `
            "left top right"
            "left main right"
        `,
        gridGap: theme.spacing.full,
        lineHeight: 1.5
    })
}));

export default function App() {
    const { selectedAssetForPreview, selectionMode, containerRef } = useMediaUi();
    const classes = useStyles({ selectionMode });

    const viewModeSelectionQuery = useQuery(VIEW_MODE_SELECTION);
    const { viewModeSelection } = viewModeSelectionQuery.data;

    return (
        <div className={classes.container} ref={containerRef}>
            <LoadingIndicator />
            <SideBarLeft gridPosition="left" />
            <TopBar gridPosition="top" />
            {viewModeSelection === VIEW_MODES.List ? (
                <ListView gridPosition="main" />
            ) : (
                <ThumbnailView gridPosition="main" />
            )}
            <Pagination />
            {!selectionMode && <SideBarRight gridPosition="right" />}

            {selectedAssetForPreview && <AssetPreview />}
            <UploadDialog />
        </div>
    );
}
