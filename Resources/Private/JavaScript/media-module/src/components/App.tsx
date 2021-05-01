import * as React from 'react';
import { useRecoilValue } from 'recoil';

import { createUseMediaUiStyles, MediaUiTheme, useMediaUi } from '@media-ui/core/src';
import { AssetUsagesModal, assetUsageDetailsModalState } from '@media-ui/feature-asset-usage/src';
import { ClipboardWatcher } from '@media-ui/feature-clipboard/src';
import { ConcurrentChangeMonitor } from '@media-ui/feature-concurrent-editing/src';
import { SimilarAssetsModal, similarAssetsModalState } from '@media-ui/feature-similar-assets/src';

import { SideBarLeft } from './SideBarLeft';
import { SideBarRight } from './SideBarRight';
import LoadingIndicator from './LoadingIndicator';
import { BottomBar } from './BottomBar';
import { TopBar } from './TopBar';
import { Main } from './Main';
import ErrorBoundary from './ErrorBoundary';
import { createAssetCollectionDialogState, createTagDialogState, uploadDialogVisibleState } from '../state';
import { CreateTagDialog, UploadDialog, CreateAssetCollectionDialog } from './Dialogs';
import { AssetPreview } from '../../../asset-preview/src';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    container: ({ selectionMode }) => ({
        display: 'grid',
        // TODO: Find a way to not calculate height to allow scrolling in main grid area
        height: `calc(100vh - 40px * 4 - 21px)`,
        gridTemplateRows: '40px 1fr',
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
        lineHeight: 1.5,
    }),
    gridColumn: {
        height: '100%',
        overflowY: 'auto',
    },
    gridRight: {
        extend: 'gridColumn',
        gridArea: 'right',
    },
    gridLeft: {
        extend: 'gridColumn',
        gridArea: 'left',
    },
    gridMain: {
        extend: 'gridColumn',
        gridArea: 'main',
    },
    gridTop: {
        gridArea: 'top',
    },
    '@global': {
        '#media-ui-app': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${theme.colors.scrollbarForeground} ${theme.colors.scrollbarBackground}`,

            '& ::-webkit-scrollbar': {
                width: theme.size.scrollbarSize,
            },
            '& ::-webkit-scrollbar-track': {
                background: theme.colors.scrollbarBackground,
            },
            '& ::-webkit-scrollbar-thumb': {
                backgroundColor: theme.colors.scrollbarForeground,
            },
        },
    },
}));

const App = () => {
    const { selectionMode, containerRef } = useMediaUi();
    const showUploadDialog = useRecoilValue(uploadDialogVisibleState);
    const { visible: showCreateTagDialog } = useRecoilValue(createTagDialogState);
    const { visible: showCreateAssetCollectionDialog } = useRecoilValue(createAssetCollectionDialogState);
    const showAssetUsagesModal = useRecoilValue(assetUsageDetailsModalState);
    const showSimilarAssetsModal = useRecoilValue(similarAssetsModalState);
    const classes = useStyles({ selectionMode });

    return (
        <div className={classes.container} ref={containerRef}>
            <LoadingIndicator />

            <div className={classes.gridLeft}>
                <ErrorBoundary>
                    <SideBarLeft />
                </ErrorBoundary>
            </div>

            <div className={classes.gridTop}>
                <TopBar />
            </div>

            <div className={classes.gridMain}>
                <ErrorBoundary>
                    <Main />
                </ErrorBoundary>
            </div>

            <BottomBar />

            {!selectionMode && (
                <div className={classes.gridRight}>
                    <ErrorBoundary>
                        <SideBarRight />
                    </ErrorBoundary>
                </div>
            )}

            <AssetPreview />
            {showAssetUsagesModal && <AssetUsagesModal />}
            {showUploadDialog && <UploadDialog />}
            {showCreateTagDialog && <CreateTagDialog />}
            {showCreateAssetCollectionDialog && <CreateAssetCollectionDialog />}
            {showSimilarAssetsModal && <SimilarAssetsModal />}

            <ClipboardWatcher />
            <ConcurrentChangeMonitor />
        </div>
    );
};

export default React.memo(App);
