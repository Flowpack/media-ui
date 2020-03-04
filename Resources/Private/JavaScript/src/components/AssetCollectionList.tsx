import * as React from 'react';
import { useMediaUi } from '../core/MediaUi';
import { useIntl } from '../core/Intl';
import { createUseMediaUiStyles } from '../core/MediaUiThemeProvider';
import { useAssetSourceFilter } from '../hooks/AssetSourceFilter';
import MediaUiTheme from '../interfaces/MediaUiTheme';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    container: {
        '.neos &': {
            padding: '0 1rem 1rem 1rem'
        }
    },
    list: {
        '& li': {
            margin: '.5rem 0',
            '& a': {
                display: 'block',
                userSelect: 'none'
            }
        }
    },
    itemSelected: {
        fontWeight: 'bold'
    },
    tags: {
        '.neos &': {
            marginLeft: '1rem'
        }
    }
}));

export default function AssetCollectionList() {
    const classes = useStyles();
    const { translate } = useIntl();
    const { assetCollections, assetCollectionFilter, setAssetCollectionFilter, assetSources } = useMediaUi();
    const [assetSourceFilter] = useAssetSourceFilter();

    const selectedAssetSource = assetSources.find(assetSource => assetSource.identifier === assetSourceFilter);

    return (
        <>
            {selectedAssetSource?.supportsCollections && (
                <nav className={classes.container}>
                    <strong>{translate('assetCollectionList.header', 'Collections')}</strong>
                    <ul className={classes.list}>
                        <li>
                            <a
                                className={!assetCollectionFilter ? classes.itemSelected : null}
                                onClick={() => setAssetCollectionFilter(null)}
                            >
                                {translate('assetCollectionList.showAll', 'All')}
                            </a>
                        </li>
                        {assetCollections &&
                            assetCollections.map(assetCollection => (
                                <li key={assetCollection.title}>
                                    <a
                                        className={
                                            assetCollectionFilter?.title == assetCollection.title
                                                ? classes.itemSelected
                                                : null
                                        }
                                        onClick={() => setAssetCollectionFilter(assetCollection)}
                                    >
                                        {assetCollection.title}
                                    </a>
                                    {assetCollection.tags && (
                                        <ul className={classes.tags}>
                                            {assetCollection.tags.map(tag => (
                                                <li key={tag.label}>{tag.label}</li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                    </ul>
                </nav>
            )}
        </>
    );
}
