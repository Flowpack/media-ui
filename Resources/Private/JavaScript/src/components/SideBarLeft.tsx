import * as React from 'react';
import { useMediaUi } from '../core/MediaUi';
import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';

const useTagListStyles = createUseStyles({
    tagSelected: {
        fontWeight: 'bold'
    }
});

export default function SideBarLeft() {
    const tagListClasses = useTagListStyles();
    const { tags, tagFilter, setTagFilter } = useMediaUi();

    const [selectedTag, setSelectedTag] = useState(tagFilter);

    useEffect(() => {
        setTagFilter(selectedTag);
    }, [selectedTag]);

    return (
        <div>
            <ul>
                {tags &&
                    tags.map(tag => (
                        <li key={tag.label}>
                            <a className={selectedTag && selectedTag.label == tag.label ? tagListClasses.tagSelected : null} onClick={() => setSelectedTag(tag)}>
                                {tag.label}
                            </a>
                        </li>
                    ))}
            </ul>
        </div>
    );
}
