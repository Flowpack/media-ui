import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { Button } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl, useMediaUi } from '@media-ui/core/src';
import { clipboardVisibleState, useClipboard } from '@media-ui/feature-clipboard/src';
import { useUnusedAssetsQuery } from '@media-ui/feature-asset-usage/src';

import { useViewModeSelection, VIEW_MODES } from '../../hooks';
import { ListView, ThumbnailView } from './index';
import LoadingLabel from '../LoadingLabel';
import { MainViewState, mainViewState } from '../../state';

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
    const [viewModeSelection] = useViewModeSelection();
    const { assets } = useMediaUi();
    const { assets: unusedAssets } = useUnusedAssetsQuery();
    const { clipboard } = useClipboard();
    const mainView = useRecoilValue(mainViewState);
    const setClipboardVisible = useSetRecoilState(clipboardVisibleState);
    const { translate } = useIntl();
    const [assetIdentities, setAssetIdentities] = useState([]);

    const queriedAssets = useMemo(() => {
        return assets.map(({ id, assetSource }) => {
            return { assetId: id, assetSourceId: assetSource.id };
        });
    }, [assets]);

    const queriedUnusedAssets = useMemo(() => {
        return unusedAssets.map(({ id, assetSource }) => {
            return { assetId: id, assetSourceId: assetSource.id };
        });
    }, [unusedAssets]);

    useEffect(() => {
        if (mainView === MainViewState.CLIPBOARD) {
            setAssetIdentities(clipboard);
        } else if (mainView === MainViewState.UNUSED_ASSETS) {
            setAssetIdentities(queriedUnusedAssets);
        } else {
            setAssetIdentities(queriedAssets);
        }
    }, [mainView, queriedAssets, queriedUnusedAssets, clipboard, setAssetIdentities]);

    return assetIdentities.length > 0 ? (
        viewModeSelection === VIEW_MODES.List ? (
            <ListView assetIdentities={assetIdentities} />
        ) : (
            <ThumbnailView assetIdentities={assetIdentities} />
        )
    ) : (
        <div className={classes.emptyStateWrapper}>
            {mainView === MainViewState.CLIPBOARD ? (
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
