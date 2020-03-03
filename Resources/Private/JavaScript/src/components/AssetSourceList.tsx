import * as React from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { useMediaUi } from '../core/MediaUi';
import { useIntl } from '../core/Intl';
import { createUseMediaUiStyles } from '../core/MediaUiThemeProvider';
import MediaUiTheme from '../interfaces/MediaUiTheme';
import { ASSET_SOURCE_FILTER, SET_ASSET_SOURCE_FILTER } from '../queries/AssetSourceFilterQuery';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    container: {
        '.neos &': {
            padding: '0 1rem 1rem 1rem'
        }
    },
    list: {
        '& li': {
            margin: '.5rem 0',
            cursor: 'pointer',
            userSelect: 'none'
        }
    },
    itemSelected: {
        fontWeight: 'bold'
    }
}));

export default function AssetSourceList() {
    const classes = useStyles();
    const { assetSources } = useMediaUi();
    const { translate } = useIntl();

    const assetSourceFilterQuery = useQuery(ASSET_SOURCE_FILTER);
    const { assetSourceFilter } = assetSourceFilterQuery.data;
    const [setAssetSourceFilter] = useMutation(SET_ASSET_SOURCE_FILTER);

    return (
        <>
            {assetSources.length > 1 && (
                <nav className={classes.container}>
                    <strong>{translate('assetSourceList.header', 'Media sources')}</strong>
                    <ul className={classes.list}>
                        {assetSources &&
                            assetSources.map(assetSource => (
                                <li key={assetSource.identifier}>
                                    <a
                                        className={
                                            assetSourceFilter === assetSource.identifier ? classes.itemSelected : null
                                        }
                                        onClick={() =>
                                            setAssetSourceFilter({
                                                variables: { assetSourceFilter: assetSource.identifier }
                                            })
                                        }
                                    >
                                        {assetSource.identifier === 'neos' ? 'Local' : assetSource.label}
                                    </a>
                                </li>
                            ))}
                    </ul>
                </nav>
            )}
        </>
    );
}
