import React, { useCallback, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { IconButton, TextInput } from '@neos-project/react-ui-components';

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

    const clearSearchBox = useCallback(() => {
        setSearchValue('');
        setSearchTerm(SearchTerm.fromString(''));
        setCurrentPage(1);
    }, [setSearchValue, setSearchTerm, handleSearch]);

    if (mainView !== MainViewMode.DEFAULT) return null;

    return (
        <div className={classes.searchBox}>
            <IconButton
                icon="search"
                size="regular"
                style="neutral"
                className={classes.searchBox__searchButton}
                hoverStyle="brand"
                onClick={handleSearch}
                disabled={!searchValue}
            />
            <TextInput
                value={searchValue}
                type="search"
                containerClassName={classes.searchBox__inputWrapper}
                onChange={(value) => setSearchValue(value)}
                onEnterKey={handleSearch}
                placeholder={translate('searchBox.placeholder', 'Search')}
            />
            <IconButton
                icon="close"
                size="regular"
                style="neutral"
                className={classes.searchBox__clearButton}
                hoverStyle="brand"
                onClick={clearSearchBox}
                disabled={!searchValue}
            />
        </div>
    );
};

export default React.memo(SearchBox);
