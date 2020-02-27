import * as React from 'react';
import { useMediaUi } from '../core/MediaUi';
import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useIntl } from '../core/Intl';

const useTagListStyles = createUseStyles({
    container: {
        padding: '1rem'
    },
    tagList: {
        '& li': {
            margin: '.3rem 0'
        }
    },
    tagSelected: {
        fontWeight: 'bold'
    }
});

export default function TagList() {
    const classes = useTagListStyles();
    const { tags, tagFilter, setTagFilter } = useMediaUi();
    const { translate } = useIntl();

    const [selectedTag, setSelectedTag] = useState(tagFilter);

    useEffect(() => {
        setTagFilter(selectedTag);
    }, [selectedTag]);

    return (
        <div className={classes.container}>
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
        </div>
    );
}
