import React from 'react';
import { useSetRecoilState } from 'recoil';
import cx from 'classnames';

import { Headline } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { useAssetSourcesQuery, useSelectAssetSource } from '@media-ui/core/src/hooks';
import { IconLabel } from '@media-ui/core/src/components';
import { clipboardVisibleState } from '@media-ui/feature-clipboard';

import classes from './AssetSourceList.module.css';

const AssetSourceList: React.FC = () => {
    const { assetSources } = useAssetSourcesQuery();
    const { translate } = useIntl();
    const [selectedAssetSource, setSelectedAssetSource] = useSelectAssetSource();
    const setClipboardVisibleState = useSetRecoilState(clipboardVisibleState);

    const handleSelectAssetSource = React.useCallback(
        (assetSourceId: string) => {
            void setSelectedAssetSource(assetSourceId);
            setClipboardVisibleState(false);
        },
        [setSelectedAssetSource, setClipboardVisibleState]
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
                    className={cx(classes.item, selectedAssetSource?.id === assetSource.id && classes.itemSelected)}
                    onClick={() => handleSelectAssetSource(assetSource.id)}
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
