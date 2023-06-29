import React, { useCallback, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { TextInput } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { currentPageState, searchTermState } from '@media-ui/core/src/state';
import { SearchTerm } from '@media-ui/core/src/domain/SearchTerm';

import { MainViewMode, mainViewState } from '../../state';

import classes from './SearchBox.module.css';

const SearchBox: React.FC = () => {
    const [searchTerm, setSearchTerm] = useRecoilState(searchTermState);
    const setCurrentPage = useSetRecoilState(currentPageState);
    const [searchValue, setSearchValue] = useState(searchTerm.toString());
    const { translate } = useIntl();
    const mainView = useRecoilValue(mainViewState);

    const handleSearch = useCallback(() => {
        setSearchTerm(SearchTerm.fromString(searchValue));
        setCurrentPage(1);
    }, [searchValue, setCurrentPage, setSearchTerm]);

    if (mainView !== MainViewMode.DEFAULT) return null;

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
