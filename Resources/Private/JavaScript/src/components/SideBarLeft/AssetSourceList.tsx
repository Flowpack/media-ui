import * as React from 'react';
import Icon from '@neos-project/react-ui-components/lib-esm/Icon';
import { useMediaUi, useIntl, createUseMediaUiStyles } from '../../core';
import { MediaUiTheme } from '../../interfaces';
import { useAssetSourceFilter } from '../../hooks';
import IconLabel from '../IconLabel';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    assetSourceList: {
        '.neos &': {
            border: `1px solid ${theme.colors.contrastDark}`
        }
    },
    item: {
        '.neos & a': {
            fontWeight: 'normal',
            cursor: 'pointer',
            userSelect: 'none'
        }
    },
    itemSelected: {
        '.neos.neos-module &': {
            fontWeight: 'bold',
            color: theme.colors.primaryBlue
        }
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
                        <IconLabel key={assetSource.identifier} icon={assetSource.iconUri} className={classes.item}>
                            <a
                                className={assetSourceFilter === assetSource.identifier ? classes.itemSelected : null}
                                onClick={() => setAssetSourceFilter(assetSource)}
                            >
                                {assetSource.identifier === 'neos'
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
