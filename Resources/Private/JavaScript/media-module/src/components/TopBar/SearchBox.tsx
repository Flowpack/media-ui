import * as React from 'react';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { TextInput } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl } from '@media-ui/core/src';
import { searchTermState } from '@media-ui/core/src/state';

import { MainViewState, mainViewState } from '../../state';

const useStyles = createUseMediaUiStyles({
    searchBox: {
        flex: 1,
        '& input[type="search"]': {
            '-webkit-appearance': 'auto',
            width: '100%',
            '&::-webkit-search-cancel-button': {
                '-webkit-appearance': 'searchfield-cancel-button',
                cursor: 'pointer',
            },
        },
    },
});

const SearchBox: React.FC = () => {
    const classes = useStyles();
    const [searchTerm, setSearchTerm] = useRecoilState(searchTermState);
    const [searchValue, setSearchValue] = useState(searchTerm);
    const { translate } = useIntl();
    const mainView = useRecoilValue(mainViewState);

    if (mainView !== MainViewState.DEFAULT) return null;

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
