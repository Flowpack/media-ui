import * as React from 'react';
import { useMediaUi } from '../core/MediaUi';
import { useIntl } from '../core/Intl';
import { createUseMediaUiStyles } from '../core/MediaUiThemeProvider';
import MediaUiTheme from '../interfaces/MediaUiTheme';
import { useQuery } from '@apollo/react-hooks';
import { ASSET_SOURCE_FILTER } from '../queries/AssetSourceFilterQuery';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    container: {
        '.neos &': {
            padding: '0 1rem 1rem 1rem'
        }
    },
    tagList: {
        '& li': {
            margin: '.5rem 0',
            '& a': {
                display: 'block',
                userSelect: 'none'
            }
        }
    },
    tagSelected: {
        fontWeight: 'bold'
    }
}));

export default function TagList() {
    const classes = useStyles();
    const { translate } = useIntl();
    const { tags, tagFilter, setTagFilter, assetSources } = useMediaUi();

    const assetSourceFilterQuery = useQuery(ASSET_SOURCE_FILTER);
    const { assetSourceFilter } = assetSourceFilterQuery.data;
    const selectedAssetSource = assetSources.find(assetSource => assetSource.identifier === assetSourceFilter);

    return (
        <>
            {selectedAssetSource?.supportsTagging && (
                <nav className={classes.container}>
                    <strong>{translate('tagList.header', 'Tags')}</strong>
                    <ul className={classes.tagList}>
                        <li>
                            <a className={!tagFilter ? classes.tagSelected : null} onClick={() => setTagFilter(null)}>
                                {translate('tagList.showAll', 'All')}
                            </a>
                        </li>
                        {tags &&
                            tags.map(tag => (
                                <li key={tag.label}>
                                    <a
                                        className={tagFilter?.label == tag.label ? classes.tagSelected : null}
                                        onClick={() => setTagFilter(tag)}
                                    >
                                        {tag.label}
                                    </a>
                                </li>
                            ))}
                    </ul>
                </nav>
            )}
        </>
    );
}
