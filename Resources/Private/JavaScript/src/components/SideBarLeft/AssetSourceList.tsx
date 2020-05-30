import * as React from 'react';

import { useMediaUi, useIntl, createUseMediaUiStyles } from '../../core';
import { MediaUiTheme } from '../../interfaces';
import { useAssetSourceFilter } from '../../hooks';
import IconLabel from '../IconLabel';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    assetSourceList: {
        border: `1px solid ${theme.colors.contrastDark}`
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        '& a': {
            fontWeight: 'normal',
            cursor: 'pointer',
            userSelect: 'none'
        }
    },
    itemSelected: {
        fontWeight: 'bold',
        color: theme.colors.primaryBlue
    }
}));

export default function AssetSourceList() {
    const classes = useStyles();
    const { assetSources } = useMediaUi();
    const { translate } = useIntl();
    const [assetSourceFilter, setAssetSourceFilter] = useAssetSourceFilter();

    return (
        <>
            {assetSources.length > 1 && (
                <nav className={classes.assetSourceList}>
                    <IconLabel icon="box" label={translate('assetSourceList.header', 'Media sources')} />
                    {assetSources?.map(assetSource => (
                        <IconLabel
                            key={assetSource.id}
                            label={assetSource.label}
                            iconUri={assetSource.iconUri}
                            className={classes.item}
                        >
                            <a
                                className={assetSourceFilter === assetSource.id ? classes.itemSelected : null}
                                onClick={() => setAssetSourceFilter(assetSource)}
                            >
                                {assetSource.id === 'neos'
                                    ? translate('assetsource.local', 'Local')
                                    : assetSource.label}
                            </a>
                        </IconLabel>
                    ))}
                </nav>
            )}
        </>
    );
}
