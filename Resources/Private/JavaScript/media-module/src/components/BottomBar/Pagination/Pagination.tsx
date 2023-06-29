import React, { useCallback, useMemo, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useIntl } from '@media-ui/core';
import { currentPageState, featureFlagsState } from '@media-ui/core/src/state';

import PaginationItem from './PaginationItem';
import { MainViewMode, mainViewState } from '../../../state';
import { useAssetCount } from '../../../hooks';

import classes from './Pagination.module.css';
import cx from 'classnames';

const Pagination: React.FC = () => {
    const [currentPage, setCurrentPage] = useRecoilState(currentPageState);
    const assetCount = useAssetCount();
    const {
        pagination: { assetsPerPage, maximumLinks },
    } = useRecoilValue(featureFlagsState);
    const { translate } = useIntl();
    const mainView = useRecoilValue(mainViewState);

    const disabled = ![MainViewMode.DEFAULT, MainViewMode.UNUSED_ASSETS].includes(mainView);
    const numberOfPages = Math.ceil(assetCount / assetsPerPage);
    const [displayRange, setDisplayRange] = useState({
        start: 0,
        end: 0,
        hasLessPages: false,
        hasMorePages: false,
        pages: [],
    });

    const handlePageClick = useCallback((page) => setCurrentPage(page), [setCurrentPage]);
    const handlePreviousPageClick = useCallback(() => setCurrentPage((prev) => prev - 1), [setCurrentPage]);
    const handleNextPageClick = useCallback(() => setCurrentPage((prev) => prev + 1), [setCurrentPage]);

    // Calculates visible display range
    useMemo(() => {
        const maxLinks = Math.min(maximumLinks, numberOfPages);
        const delta = Math.floor(maxLinks / 2);

        let start = currentPage - delta;
        let end = currentPage + delta + (maxLinks % 2 === 0 ? 1 : 0);

        if (start < 1) {
            end -= start - 1;
        }
        if (end > numberOfPages) {
            start -= end - numberOfPages;
        }

        start = Math.max(start, 1);
        end = Math.min(end, numberOfPages);

        const pages = [...Array(end - start + 1)].map((_, i) => i + start);

        setDisplayRange({
            start,
            end,
            hasLessPages: start > 2,
            hasMorePages: end + 1 < numberOfPages,
            pages,
        });
    }, [maximumLinks, numberOfPages, currentPage]);

    return (
        <nav className={classes.pagination}>
            {numberOfPages > 0 && (
                <ol className={cx(classes.list, disabled && classes.disabled)}>
                    <PaginationItem
                        icon="angle-left"
                        title={translate('pagination.previousPageTitle', `Go to previous page`)}
                        onClick={handlePreviousPageClick}
                        disabled={disabled || currentPage <= 1}
                    />
                    {displayRange.start > 1 && (
                        <PaginationItem
                            title={translate('pagination.firstPageTitle', `Go to first page`)}
                            onClick={handlePageClick}
                            disabled={disabled}
                            page={1}
                        />
                    )}
                    {displayRange.hasLessPages && <li className={classes.ellipsis}>…</li>}
                    {displayRange.pages.map((page) => (
                        <PaginationItem
                            key={page}
                            selected={currentPage === page}
                            onClick={handlePageClick}
                            disabled={disabled}
                            title={translate('pagination.page', `Go to page ${page}`, [page])}
                            page={page}
                        />
                    ))}
                    {displayRange.hasMorePages && <li className={classes.ellipsis}>…</li>}
                    {displayRange.end < numberOfPages && (
                        <PaginationItem
                            title={translate('pagination.lastPageTitle', `Go to last page`)}
                            onClick={handlePageClick}
                            disabled={disabled}
                            page={numberOfPages}
                        />
                    )}
                    <PaginationItem
                        icon="angle-right"
                        title={translate('pagination.nextPageTitle', `Go to next page`)}
                        onClick={handleNextPageClick}
                        disabled={disabled || currentPage === numberOfPages}
                    />
                </ol>
            )}
        </nav>
    );
};

export default React.memo(Pagination);
