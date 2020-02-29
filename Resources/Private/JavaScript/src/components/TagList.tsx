import * as React from 'react';
import { useMediaUi } from '../core/MediaUi';
import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useIntl } from '../core/Intl';
import { useMediaUiTheme } from '../core/MediaUiThemeProvider';

const useTagListStyles = createUseStyles({
    container: {
        '.neos &': {
            padding: '0 1rem 1rem 1rem'
        }
    },
    tagList: {
        '& li': {
            margin: '.5rem 0',
            cursor: 'pointer',
            userSelect: 'none'
        }
    },
    tagSelected: {
        fontWeight: 'bold'
    }
});

export default function TagList() {
    const theme = useMediaUiTheme();
    const classes = useTagListStyles({ theme });
    const { tags, tagFilter, setTagFilter } = useMediaUi();
    const { translate } = useIntl();

    const [selectedTag, setSelectedTag] = useState(tagFilter);

    useEffect(() => {
        setTagFilter(selectedTag);
    }, [selectedTag]);

    return (
        <nav className={classes.container}>
            <strong>{translate('tagList.header', 'Tags')}</strong>
            <ul className={classes.tagList}>
                <li>
                    <a className={!selectedTag ? classes.tagSelected : null} onClick={() => setSelectedTag(null)}>
                        {translate('tagList.showAll', 'All')}
                    </a>
                </li>
                {tags &&
                    tags.map(tag => (
                        <li key={tag.label}>
                            <a
                                className={selectedTag && selectedTag.label == tag.label ? classes.tagSelected : null}
                                onClick={() => setSelectedTag(tag)}
                            >
                                {tag.label}
                            </a>
                        </li>
                    ))}
            </ul>
        </nav>
    );
}
