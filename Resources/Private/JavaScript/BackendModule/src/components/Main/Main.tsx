import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useQuery } from '@apollo/client';

import { useClipboard, VIEW_MODES } from '../../hooks';
import { ListView, ThumbnailView } from './index';
import { VIEW_MODE_SELECTION } from '../../queries';
import { useIntl, useMediaUi } from '../../core';
import { clipboardState } from '../../state';
import LoadingLabel from '../LoadingLabel';

const Main: React.FC = () => {
    // TODO: Extract viewmode query into custom hook
    const viewModeSelectionQuery = useQuery<{ viewModeSelection: VIEW_MODES }>(VIEW_MODE_SELECTION);
    const { viewModeSelection } = viewModeSelectionQuery.data;
    const { assets } = useMediaUi();
    const { clipboard } = useClipboard();
    const { visible: showClipboard } = useRecoilValue(clipboardState);
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
        <LoadingLabel
            loadingText={translate('assetList.loading', 'Loading assets')}
            emptyText={translate('assetList.empty', 'No assets found')}
        />
    );
};

export default React.memo(Main);
