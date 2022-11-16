import * as React from 'react';
import { useRecoilValue } from 'recoil';

import { createUseMediaUiStyles, InteractionDialogRenderer, MediaUiTheme, useMediaUi } from '@media-ui/core/src';
import { useSelectAsset } from '@media-ui/core/src/hooks';
import { AssetIdentity } from '@media-ui/core/src/interfaces';
import { AssetUsagesModal, assetUsageDetailsModalState } from '@media-ui/feature-asset-usage/src';
import { ClipboardWatcher } from '@media-ui/feature-clipboard/src';
import { ConcurrentChangeMonitor } from '@media-ui/feature-concurrent-editing/src';
import { SimilarAssetsModal, similarAssetsModalState } from '@media-ui/feature-similar-assets/src';
import { uploadDialogVisibleState } from '@media-ui/feature-asset-upload/src/state';
import { UploadDialog } from '@media-ui/feature-asset-upload/src/components';

import LoadingIndicator from '@media-ui/media-module/src/components/LoadingIndicator';
import ErrorBoundary from '@media-ui/media-module/src/components/ErrorBoundary';
import { createAssetCollectionDialogState, createTagDialogState } from '@media-ui/media-module/src/state';
import { CreateTagDialog, CreateAssetCollectionDialog } from '@media-ui/media-module/src/components/Dialogs';
import { AssetInspector } from '@media-ui/media-module/src/components/SideBarRight/Inspector';
import Preview from './Preview';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    container: {
        height: `calc(100vh - 3 * ${theme.spacing.goldenUnit} + ${theme.spacing.half})`,
        lineHeight: 1.5,
        overflow: 'hidden',
        paddingTop: `calc(${theme.spacing.goldenUnit} - 1rem)`, // To account for the top right button of the secondary inspector
    },
    main: {
        display: 'grid',
        gridTemplateColumns: `${theme.size.sidebarWidth} 1fr`,
        height: '100%',
        overflow: 'auto',
        gridGap: theme.spacing.full,
    },
}));

interface DetailsProps {
    assetIdentity: AssetIdentity;
}

const Details = ({ assetIdentity }: DetailsProps) => {
    const { selectionMode, isInNodeCreationDialog, containerRef } = useMediaUi();
    const { visible: showUploadDialog } = useRecoilValue(uploadDialogVisibleState);
    const { visible: showCreateTagDialog } = useRecoilValue(createTagDialogState);
    const { visible: showCreateAssetCollectionDialog } = useRecoilValue(createAssetCollectionDialogState);
    const showAssetUsagesModal = useRecoilValue(assetUsageDetailsModalState);
    const showSimilarAssetsModal = useRecoilValue(similarAssetsModalState);
    const selectAsset = useSelectAsset();
    const classes = useStyles({ selectionMode, isInNodeCreationDialog });

    React.useEffect(() => {
        selectAsset(assetIdentity);
    }, [assetIdentity, selectAsset]);

    return (
        <div className={classes.container} ref={containerRef}>
            <LoadingIndicator />

            <div className={classes.main}>
                <ErrorBoundary>
                    <AssetInspector />
                    <Preview assetIdentity={assetIdentity} />
                </ErrorBoundary>
            </div>

            {showAssetUsagesModal && <AssetUsagesModal />}
            {showUploadDialog && <UploadDialog />}
            {showCreateTagDialog && <CreateTagDialog />}
            {showCreateAssetCollectionDialog && <CreateAssetCollectionDialog />}
            {showSimilarAssetsModal && <SimilarAssetsModal />}

            <InteractionDialogRenderer />
            <ClipboardWatcher />
            <ConcurrentChangeMonitor />
        </div>
    );
};

export default React.memo(Details);
