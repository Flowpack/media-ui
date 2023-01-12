import * as React from 'react';
import { useCallback, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { TextInput } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl } from '@media-ui/core/src';
import { currentPageState, searchTermState } from '@media-ui/core/src/state';
import { SearchTerm } from '@media-ui/core/src/domain/SearchTerm';

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
    const setCurrentPage = useSetRecoilState(currentPageState);
    const [searchValue, setSearchValue] = useState(searchTerm.toString());
    const { translate } = useIntl();
    const mainView = useRecoilValue(mainViewState);

    const handleSearch = useCallback(() => {
        setSearchTerm(SearchTerm.fromString(searchValue));
        setCurrentPage(1);
    }, [searchValue, setCurrentPage, setSearchTerm]);

    if (mainView !== MainViewState.DEFAULT) return null;

    return (
        <div className={classes.searchBox}>
            <TextInput
                value={searchValue}
                type="search"
                onChange={(value) => setSearchValue(value)}
                onEnterKey={handleSearch}
                placeholder={translate('searchBox.placeholder', 'Search')}
            />
        </div>
    );
};

export default React.memo(SearchBox);
