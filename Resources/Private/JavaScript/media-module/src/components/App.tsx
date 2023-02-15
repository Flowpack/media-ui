import * as React from 'react';
import { useRecoilValue } from 'recoil';

import { createUseMediaUiStyles, InteractionDialogRenderer, MediaUiTheme, useMediaUi } from '@media-ui/core/src';
import { useSelectAsset, useSelectAssetSource } from '@media-ui/core/src/hooks';
import { searchTermState } from '@media-ui/core/src/state';
import { AssetUsagesModal, assetUsageDetailsModalState } from '@media-ui/feature-asset-usage/src';
import { ClipboardWatcher } from '@media-ui/feature-clipboard/src';
import { ConcurrentChangeMonitor } from '@media-ui/feature-concurrent-editing/src';
import { SimilarAssetsModal, similarAssetsModalState } from '@media-ui/feature-similar-assets/src';
import { uploadDialogVisibleState } from '@media-ui/feature-asset-upload/src/state';
import { UploadDialog } from '@media-ui/feature-asset-upload/src/components';
import { AssetPreview } from '@media-ui/feature-asset-preview/src';
import { assetVariantModalState, VariantModal } from '@media-ui/feature-asset-variants/src';

import { SideBarLeft } from './SideBarLeft';
import { SideBarRight } from './SideBarRight';
import LoadingIndicator from './LoadingIndicator';
import { BottomBar } from './BottomBar';
import { TopBar } from './TopBar';
import { Main } from './Main';
import ErrorBoundary from './ErrorBoundary';
import { createAssetCollectionDialogState, createTagDialogState } from '../state';
import { CreateTagDialog, CreateAssetCollectionDialog } from './Dialogs';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    container: ({ selectionMode, isInNodeCreationDialog }) => ({
        display: 'grid',
        // TODO: Find a way to not calculate height to allow scrolling in main grid area
        height: isInNodeCreationDialog
            ? `calc(100% - 61px - 8px)` // Remove bottom bar and add padding
            : `calc(100vh - 48px - 61px - 41px)`, // Remove top bar, body padding and bottom bar
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
        overflow: 'hidden',
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
        '.neos.neos-module-management-mediaui > .neos-module-wrap': {
            paddingLeft: '1rem',
            paddingRight: '1rem',
            paddingTop: '3rem',
            paddingBottom: '0',
        },
        // Hack to prevent a dropdown to be behind the bottom bar - issue #79
        'body > [class*="_selectBox__contents_"]': {
            zIndex: 99999,
        },
    },
}));

const App = () => {
    const { selectionMode, isInNodeCreationDialog, containerRef } = useMediaUi();
    const { visible: showUploadDialog } = useRecoilValue(uploadDialogVisibleState);
    const { visible: showCreateTagDialog } = useRecoilValue(createTagDialogState);
    const { visible: showCreateAssetCollectionDialog } = useRecoilValue(createAssetCollectionDialogState);
    const showAssetUsagesModal = useRecoilValue(assetUsageDetailsModalState);
    const showSimilarAssetsModal = useRecoilValue(similarAssetsModalState);
    const showVariantModal = useRecoilValue(assetVariantModalState);
    const searchTerm = useRecoilValue(searchTermState);
    const selectAsset = useSelectAsset();
    const [, selectAssetSource] = useSelectAssetSource();
    const classes = useStyles({ selectionMode, isInNodeCreationDialog });

    React.useEffect(() => {
        const assetId = searchTerm.getAssetIdentifierIfPresent();
        if (assetId) {
            selectAsset(assetId);
            void selectAssetSource('neos');
        }
        // Don't include `selectAsset` and `selectAssetSource` to prevent constant reloads
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

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
            {showVariantModal && <VariantModal />}

            <InteractionDialogRenderer />
            <ClipboardWatcher />
            <ConcurrentChangeMonitor />
        </div>
    );
};

export default React.memo(App);
