import React from 'react';
import { useRecoilValue } from 'recoil';
import cx from 'classnames';

import { InteractionDialogRenderer, useMediaUi } from '@media-ui/core';
import { useSelectAsset, useAssetQuery } from '@media-ui/core/src/hooks';
import { Asset } from '@media-ui/core/src/interfaces';
import { AssetUsagesModal, assetUsageDetailsModalState } from '@media-ui/feature-asset-usage';
import { ClipboardWatcher } from '@media-ui/feature-clipboard';
import { ConcurrentChangeMonitor } from '@media-ui/feature-concurrent-editing';
import { SimilarAssetsModal, similarAssetsModalState } from '@media-ui/feature-similar-assets';
import { uploadDialogState } from '@media-ui/feature-asset-upload/src/state';
import { UploadDialog } from '@media-ui/feature-asset-upload/src/components';
import LoadingIndicator from '@media-ui/media-module/src/components/LoadingIndicator';
import ErrorBoundary from '@media-ui/media-module/src/components/ErrorBoundary';
import { AssetInspector } from '@media-ui/media-module/src/components/SideBarRight/Inspector';
import { CreateTagDialog, createTagDialogState } from '@media-ui/feature-asset-tags';
import {
    CreateAssetCollectionDialog,
    createAssetCollectionDialogVisibleState,
} from '@media-ui/feature-asset-collections';

import Preview from './Preview';

import theme from '@media-ui/core/src/Theme.module.css';
import classes from './Details.module.css';

interface DetailsProps {
    assetIdentity: AssetIdentity;
    buildLinkToMediaUi: (asset: Asset) => string;
}

const Details = ({ assetIdentity, buildLinkToMediaUi }: DetailsProps) => {
    const { containerRef } = useMediaUi();
    const { visible: showUploadDialog } = useRecoilValue(uploadDialogState);
    const { visible: showCreateTagDialog } = useRecoilValue(createTagDialogState);
    const showCreateAssetCollectionDialog = useRecoilValue(createAssetCollectionDialogVisibleState);
    const showAssetUsagesModal = useRecoilValue(assetUsageDetailsModalState);
    const showSimilarAssetsModal = useRecoilValue(similarAssetsModalState);
    const selectAsset = useSelectAsset();
    const { asset, loading } = useAssetQuery(assetIdentity);

    React.useEffect(() => {
        selectAsset(assetIdentity);
    }, [assetIdentity, selectAsset]);

    return (
        <div className={cx(classes.container, theme.mediaModuleTheme, loading && classes.loading)} ref={containerRef}>
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
