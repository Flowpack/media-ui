import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useIntl, createUseMediaUiStyles } from '@media-ui/core/src';
import { currentPageState } from '@media-ui/core/src/state';
import { ASSETS_PER_PAGE, PAGINATION_MAXIMUM_LINKS } from '@media-ui/core/src/constants/pagination';

import PaginationItem from './PaginationItem';
import { MainViewState, mainViewState } from '../../../state';
import { useAssetCount } from '../../../hooks';

const useStyles = createUseMediaUiStyles({
    pagination: {
        justifySelf: 'center',
    },
    list: {
        display: 'flex',
        justifySelf: 'center',
        listStyleType: 'none',
        textAlign: 'center',
    },
    ellipsis: {
        lineHeight: '2.4rem',
    },
});

const Pagination: React.FC = () => {
    const classes = useStyles();
    const [currentPage, setCurrentPage] = useRecoilState(currentPageState);
    const assetCount = useAssetCount();
    const { translate } = useIntl();
    const mainView = useRecoilValue(mainViewState);

    const disabled = ![MainViewState.DEFAULT, MainViewState.UNUSED_ASSETS].includes(mainView);
    const numberOfPages = Math.ceil(assetCount / ASSETS_PER_PAGE);
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
        const maxLinks = Math.min(PAGINATION_MAXIMUM_LINKS, numberOfPages);
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
    }, [numberOfPages, currentPage]);

    return (
        <nav className={classes.pagination}>
            {numberOfPages > 0 && (
                <ol className={classes.list}>
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
