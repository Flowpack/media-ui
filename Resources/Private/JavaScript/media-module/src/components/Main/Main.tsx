import React, { useEffect, useMemo, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { Button } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl } from '@media-ui/core/src';
import { availableAssetIdentitiesState } from '@media-ui/core/src/state';
import { clipboardState, clipboardVisibleState } from '@media-ui/feature-clipboard';
import { useUnusedAssetsQuery } from '@media-ui/feature-asset-usage/src';

import { ListView, ThumbnailView } from './index';
import LoadingLabel from '../LoadingLabel';
import { MainViewMode, mainViewState, VIEW_MODES, viewModeState } from '../../state';

const useStyles = createUseMediaUiStyles({
    emptyStateWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'inherit',
    },
});

const Main: React.FC = () => {
    const classes = useStyles();
    const viewModeSelection = useRecoilValue(viewModeState);
    const { assets: unusedAssets } = useUnusedAssetsQuery();
    const clipboard = useRecoilValue(clipboardState);
    const mainView = useRecoilValue(mainViewState);
    const setClipboardVisible = useSetRecoilState(clipboardVisibleState);
    const { translate } = useIntl();
    const availableAssetIdentities = useRecoilValue(availableAssetIdentitiesState);
    const [visibleAssetIdentities, setVisibleAssetIdentities] = useState<AssetIdentity[]>(availableAssetIdentities);

    const queriedUnusedAssets = useMemo(() => {
        return unusedAssets
            .filter((asset) => asset?.id)
            .map(({ id, assetSource }) => {
                return { assetId: id, assetSourceId: assetSource.id };
            });
    }, [unusedAssets]);

    useEffect(() => {
        if (mainView === MainViewMode.CLIPBOARD) {
            setVisibleAssetIdentities(clipboard);
        } else if (mainView === MainViewMode.UNUSED_ASSETS) {
            setVisibleAssetIdentities(queriedUnusedAssets);
        } else {
            setVisibleAssetIdentities(availableAssetIdentities);
        }
    }, [mainView, availableAssetIdentities, queriedUnusedAssets, clipboard]);

    return visibleAssetIdentities.length > 0 ? (
        viewModeSelection === VIEW_MODES.List ? (
            <ListView assetIdentities={visibleAssetIdentities} />
        ) : (
            <ThumbnailView assetIdentities={visibleAssetIdentities} />
        )
    ) : (
        <div className={classes.emptyStateWrapper}>
            {mainView === MainViewMode.CLIPBOARD ? (
                <Button size="regular" style="brand" hoverStyle="brand" onClick={() => setClipboardVisible(false)}>
                    {translate('clipboard.close', 'Close clipboard')}
                </Button>
            ) : (
                <LoadingLabel
                    loadingText={translate('assetList.loading', 'Loading assets')}
                    emptyText={translate('assetList.empty', 'No assets found')}
                />
            )}
        </div>
    );
};

export default React.memo(Main);
