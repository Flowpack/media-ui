import * as React from 'react';
import { useMediaUi } from '../core/MediaUi';
import { useEffect, useState } from 'react';
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

    const [selectedTag, setSelectedTag] = useState(tagFilter);

    useEffect(() => {
        setTagFilter(selectedTag);
    }, [selectedTag]);

    return (
        <>
            {selectedAssetSource?.supportsTagging && (
                <nav className={classes.container}>
                    <strong>{translate('tagList.header', 'Tags')}</strong>
                    <ul className={classes.tagList}>
                        <li>
                            <a
                                className={!selectedTag ? classes.tagSelected : null}
                                onClick={() => setSelectedTag(null)}
                            >
                                {translate('tagList.showAll', 'All')}
                            </a>
                        </li>
                        {tags &&
                            tags.map(tag => (
                                <li key={tag.label}>
                                    <a
                                        className={
                                            selectedTag && selectedTag.label == tag.label ? classes.tagSelected : null
                                        }
                                        onClick={() => setSelectedTag(tag)}
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
