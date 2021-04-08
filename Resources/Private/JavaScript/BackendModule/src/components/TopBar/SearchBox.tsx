import * as React from 'react';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { TextInput } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl } from '../../core';
import { clipboardState, searchTermState } from '../../state';

const useStyles = createUseMediaUiStyles({
    searchBox: {
        '& input': {
            width: '100%',
        },
    },
});

const SearchBox: React.FC = () => {
    const classes = useStyles();
    const [searchTerm, setSearchTerm] = useRecoilState(searchTermState);
    const [searchValue, setSearchValue] = useState(searchTerm);
    const { translate } = useIntl();
    const { visible: showClipboard } = useRecoilValue(clipboardState);

    if (showClipboard) return null;

    return (
        <div className={classes.searchBox}>
            <TextInput
                value={searchValue}
                type="search"
                onChange={(value) => setSearchValue(value)}
                onEnterKey={() => setSearchTerm(searchValue)}
                placeholder={translate('searchBox.placeholder', 'Search')}
            />
        </div>
    );
};

export default React.memo(SearchBox);
