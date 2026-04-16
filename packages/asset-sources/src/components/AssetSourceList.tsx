import React, { useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import cx from 'classnames';

import { Headline } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { IconLabel } from '@media-ui/core/src/components';
import { selectedAssetIdState } from '@media-ui/core/src/state';
import { selectedAssetCollectionIdState } from '@media-ui/feature-asset-collections';

import { selectedAssetSourceState } from '../state/selectedAssetSourceState';
import { useAssetSourcesQuery } from '../hooks/useAssetSourcesQuery';

import classes from './AssetSourceList.module.css';

const AssetSourceList: React.FC = () => {
    const { assetSources } = useAssetSourcesQuery();
    const { translate } = useIntl();
    const [selectedAssetSourceId, setSelectedAssetSourceId] = useRecoilState(selectedAssetSourceState);
    const setSelectedAsset = useSetRecoilState(selectedAssetIdState);
    const setSelectedAssetCollection = useSetRecoilState(selectedAssetCollectionIdState);

    const chooseSelectedAssetSource = useCallback(
        (assetSourceId: AssetSourceId) => {
            setSelectedAsset(null);
            setSelectedAssetCollection(null);
            setSelectedAssetSourceId(assetSourceId);
        },
        [setSelectedAsset, setSelectedAssetCollection, setSelectedAssetSourceId]
    );

    // We don't show the source selection if there is only one
    if (!assetSources || assetSources.length < 2) return null;

    return (
        <nav className={classes.assetSourceList}>
            <Headline type="h2" className={classes.header}>
                <IconLabel icon="box" label={translate('assetSourceList.header', 'Media sources')} />
            </Headline>
            {assetSources?.map((assetSource) => (
                <button
                    key={assetSource.id}
                    type="button"
                    className={cx(classes.item, selectedAssetSourceId === assetSource.id && classes.itemSelected)}
                    onClick={() => chooseSelectedAssetSource(assetSource.id)}
                >
                    <IconLabel
                        label={assetSource.id === 'neos' ? translate('assetSource.local', 'Local') : assetSource.label}
                        iconUri={assetSource.iconUri}
                        className={classes.itemLabel}
                    />
                </button>
            ))}
        </nav>
    );
};

export default React.memo(AssetSourceList);
