import * as React from 'react';
import { useMediaUi } from '../core/MediaUi';
import { useState } from 'react';
import { createUseStyles } from 'react-jss';

const useTagListStyles = createUseStyles({
    tagSelected: {
        fontWeight: 'bold'
    }
});

export default function SideBarLeft() {
    const tagListClasses = useTagListStyles();
    const { tags } = useMediaUi();

    const [selectedTag, setSelectedTag] = useState(null);

    return (
        <div>
            <ul>
                {tags &&
                    tags.map(tag => (
                        <li key={tag.label}>
                            <a className={selectedTag === tag ? tagListClasses.tagSelected : null} onClick={() => setSelectedTag(tag)}>
                                {tag.label}
                            </a>
                        </li>
                    ))}
            </ul>
        </div>
    );
}
