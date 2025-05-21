import React, { useEffect, useMemo, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { Button } from '@neos-project/react-ui-components';

import { useIntl, useNotify } from '@media-ui/core';
import { availableAssetIdentitiesState, searchTermState } from '@media-ui/core/src/state';
import useAssetsQuery from '@media-ui/core/src/hooks/useAssetsQuery';
import { clipboardState, clipboardVisibleState } from '@media-ui/feature-clipboard';
import { useUnusedAssetsQuery } from '@media-ui/feature-asset-usage';

import { ListView, ThumbnailView } from './index';
import LoadingLabel from '../LoadingLabel';
import { MainViewMode, mainViewState, VIEW_MODES, viewModeState } from '../../state';

import classes from './Main.module.css';

const Main: React.FC = () => {
    const viewModeSelection = useRecoilValue(viewModeState);
    const { assets: unusedAssets } = useUnusedAssetsQuery();
    // The useAssetsQuery should always be registered here to ensure that the assets are loaded
    const { error: assetsLoadingError } = useAssetsQuery();
    const clipboard = useRecoilValue(clipboardState);
    const mainView = useRecoilValue(mainViewState);
    const setClipboardVisible = useSetRecoilState(clipboardVisibleState);
    const searchTerm = useRecoilValue(searchTermState);
    const { translate } = useIntl();
    const Notify = useNotify();
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

    // Output loading errors to the console
    useEffect(() => {
        if (assetsLoadingError) {
            Notify.error('Error loading assets', assetsLoadingError.message);
        }
    }, [Notify, assetsLoadingError]);

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
                    emptyText={
                        searchTerm?.toString()
                            ? translate('assetList.emptyForSearchTerm', `No assets found for "${searchTerm}"`, {
                                  searchTerm,
                              })
                            : translate('assetList.empty', 'No assets found')
                    }
                />
            )}
        </div>
    );
};

export default React.memo(Main);
