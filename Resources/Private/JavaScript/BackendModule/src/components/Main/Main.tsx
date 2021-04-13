import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { useQuery } from '@apollo/client';

import { Button } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, useMediaUi } from '@media-ui/core/src';
import { clipboardState, useClipboard } from '@media-ui/feature-clipboard/src';

import { VIEW_MODES } from '../../hooks';
import { ListView, ThumbnailView } from './index';
import { VIEW_MODE_SELECTION } from '../../queries';
import LoadingLabel from '../LoadingLabel';

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
    // TODO: Extract viewmode query into custom hook
    const viewModeSelectionQuery = useQuery<{ viewModeSelection: VIEW_MODES }>(VIEW_MODE_SELECTION);
    const { viewModeSelection } = viewModeSelectionQuery.data;
    const { assets } = useMediaUi();
    const { clipboard } = useClipboard();
    const [{ visible: showClipboard }, setClipboardState] = useRecoilState(clipboardState);
    const { translate } = useIntl();
    const [assetIdentities, setAssetIdentities] = useState([]);

    useEffect(() => {
        const ids = showClipboard
            ? clipboard
            : assets.map(({ id, assetSource }) => {
                  return { assetId: id, assetSourceId: assetSource.id };
              });
        window.setTimeout(() => setAssetIdentities(ids), 0);
    }, [assets, clipboard, showClipboard, setAssetIdentities]);

    return assetIdentities.length > 0 ? (
        viewModeSelection === VIEW_MODES.List ? (
            <ListView assetIdentities={assetIdentities} />
        ) : (
            <ThumbnailView assetIdentities={assetIdentities} />
        )
    ) : (
        <div className={classes.emptyStateWrapper}>
            {showClipboard ? (
                <Button
                    size="regular"
                    style="brand"
                    hoverStyle="brand"
                    onClick={() => setClipboardState({ visible: false })}
                >
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
