import React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import cx from 'classnames';

import { InteractionDialogRenderer, useMediaUi } from '@media-ui/core';
import { useSelectAsset } from '@media-ui/core/src/hooks';
import { searchTermState } from '@media-ui/core/src/state';
import { AssetUsagesModal, assetUsageDetailsModalState } from '@media-ui/feature-asset-usage';
import { ClipboardWatcher } from '@media-ui/feature-clipboard';
import { ConcurrentChangeMonitor } from '@media-ui/feature-concurrent-editing';
import { SimilarAssetsModal, similarAssetsModalState } from '@media-ui/feature-similar-assets';
import { uploadDialogVisibleState } from '@media-ui/feature-asset-upload/src/state';
import { UploadDialog } from '@media-ui/feature-asset-upload/src/components';
import { AssetPreview } from '@media-ui/feature-asset-preview';
import { EditAssetDialog, editAssetDialogState } from '@media-ui/feature-asset-editing';
import { CreateTagDialog, createTagDialogState } from '@media-ui/feature-asset-tags';
import { CreateAssetCollectionDialog, createAssetCollectionDialogState } from '@media-ui/feature-asset-collections';
import { selectedAssetSourceState } from '@media-ui/feature-asset-sources';

import SideBarLeft from './SideBarLeft/SideBarLeft';
import { SideBarRight } from './SideBarRight';
import LoadingIndicator from './LoadingIndicator';
import { BottomBar } from './BottomBar';
import { TopBar } from './TopBar';
import { Main } from './Main';
import ErrorBoundary from './ErrorBoundary';

import theme from '@media-ui/core/src/Theme.module.css';
import classes from './App.module.css';
import './Global.module.css';

const App = () => {
    const { selectionMode, isInNodeCreationDialog, containerRef } = useMediaUi();
    const { visible: showUploadDialog } = useRecoilValue(uploadDialogVisibleState);
    const { visible: showCreateTagDialog } = useRecoilValue(createTagDialogState);
    const showCreateAssetCollectionDialog = useRecoilValue(createAssetCollectionDialogState);
    const showEditAssetDialog = useRecoilValue(editAssetDialogState);
    const showAssetUsagesModal = useRecoilValue(assetUsageDetailsModalState);
    const showSimilarAssetsModal = useRecoilValue(similarAssetsModalState);
    const searchTerm = useRecoilValue(searchTermState);
    const selectAsset = useSelectAsset();
    const selectAssetSource = useSetRecoilState(selectedAssetSourceState);

    // TODO: Implement asset source selection via recoil an atom effect in `searchTermState` to avoid this dangerous effect
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
        <div
            className={cx(
                classes.container,
                selectionMode && classes.containerSelectionMode,
                isInNodeCreationDialog && classes.containerIsInNodeCreationDialog,
                classes.mediaModuleApp,
                theme.mediaModuleTheme
            )}
            ref={containerRef}
        >
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
            {showEditAssetDialog && <EditAssetDialog />}
            {showCreateTagDialog && <CreateTagDialog />}
            {showCreateAssetCollectionDialog && <CreateAssetCollectionDialog />}
            {showSimilarAssetsModal && <SimilarAssetsModal />}

            <InteractionDialogRenderer />
            <ClipboardWatcher />
            <ConcurrentChangeMonitor />
        </div>
    );
};

export default React.memo(App);
