import React from 'react';
import { useRecoilValue } from 'recoil';
import cx from 'classnames';

import { createUseMediaUiStyles, InteractionDialogRenderer, MediaUiTheme, useMediaUi } from '@media-ui/core';
import { useSelectAsset, useAssetQuery } from '@media-ui/core/src/hooks';
import { Asset } from '@media-ui/core/src/interfaces';
import { AssetUsagesModal, assetUsageDetailsModalState } from '@media-ui/feature-asset-usage';
import { ClipboardWatcher } from '@media-ui/feature-clipboard';
import { ConcurrentChangeMonitor } from '@media-ui/feature-concurrent-editing';
import { SimilarAssetsModal, similarAssetsModalState } from '@media-ui/feature-similar-assets';
import { uploadDialogVisibleState } from '@media-ui/feature-asset-upload/src/state';
import { UploadDialog } from '@media-ui/feature-asset-upload/src/components';

import LoadingIndicator from '@media-ui/media-module/src/components/LoadingIndicator';
import ErrorBoundary from '@media-ui/media-module/src/components/ErrorBoundary';
import { CreateTagDialog, createTagDialogState } from '@media-ui/feature-asset-tags';
import { CreateAssetCollectionDialog, createAssetCollectionDialogState } from '@media-ui/feature-asset-collections';
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
        gridGap: theme.spacing.full,
    },
    inspector: {
        height: '100%',
        overflow: 'auto',
    },
    loading: {
        '&$container': {
            cursor: 'wait',
        },
        '&$main': {
            pointerEvents: 'none',
        },
    },
}));

interface DetailsProps {
    assetIdentity: AssetIdentity;
    buildLinkToMediaUi: (asset: Asset) => string;
}

const Details = ({ assetIdentity, buildLinkToMediaUi }: DetailsProps) => {
    const { selectionMode, isInNodeCreationDialog, containerRef } = useMediaUi();
    const { visible: showUploadDialog } = useRecoilValue(uploadDialogVisibleState);
    const { visible: showCreateTagDialog } = useRecoilValue(createTagDialogState);
    const showCreateAssetCollectionDialog = useRecoilValue(createAssetCollectionDialogState);
    const showAssetUsagesModal = useRecoilValue(assetUsageDetailsModalState);
    const showSimilarAssetsModal = useRecoilValue(similarAssetsModalState);
    const selectAsset = useSelectAsset();
    const { asset, loading } = useAssetQuery(assetIdentity);
    const classes = useStyles({ selectionMode, isInNodeCreationDialog });

    React.useEffect(() => {
        selectAsset(assetIdentity);
    }, [assetIdentity, selectAsset]);

    return (
        <div className={cx(classes.container, loading && classes.loading)} ref={containerRef}>
            <LoadingIndicator />

            <div className={cx(classes.main, loading && classes.loading)}>
                <ErrorBoundary>
                    <div className={classes.inspector}>
                        <AssetInspector />
                    </div>
                    <Preview asset={asset} loading={loading} buildLinkToMediaUi={buildLinkToMediaUi} />
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
