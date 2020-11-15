import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';

import { ASSETS_PER_PAGE, PAGINATION_MAXIMUM_LINKS, createUseMediaUiStyles, useIntl } from '../../core';
import { MediaUiTheme } from '../../interfaces';
import { currentPageState } from '../../state';
import { useAssetCountQuery } from '../../hooks';
import { AssetCount, PaginationItem } from './index';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    pagination: {
        display: 'grid',
        gridTemplateColumns: theme.size.sidebarWidth + ' 1fr ' + theme.size.sidebarWidth,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.moduleBackground,
        zIndex: theme.paginationZIndex
    },
    list: {
        display: 'flex',
        justifySelf: 'center',
        listStyleType: 'none',
        textAlign: 'center'
    },
    ellipsis: {
        lineHeight: '2.4rem'
    }
}));

const Pagination: React.FC = () => {
    const classes = useStyles();
    const [currentPage, setCurrentPage] = useRecoilState(currentPageState);
    const { assetCount } = useAssetCountQuery();
    const { translate } = useIntl();

    const numberOfPages = Math.ceil(assetCount / ASSETS_PER_PAGE);
    const [displayRange, setDisplayRange] = useState({
        start: 0,
        end: 0,
        hasLessPages: false,
        hasMorePages: false,
        pages: []
    });

    const handlePageClick = useCallback(page => setCurrentPage(page), [setCurrentPage]);
    const handlePreviousPageClick = useCallback(() => setCurrentPage(prev => prev - 1), [setCurrentPage]);
    const handleNextPageClick = useCallback(() => setCurrentPage(prev => prev + 1), [setCurrentPage]);

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
            pages
        });
    }, [numberOfPages, currentPage]);

    return (
        <nav className={classes.pagination}>
            <AssetCount />
            {numberOfPages > 0 && (
                <ol className={classes.list}>
                    {currentPage > 1 && (
                        <PaginationItem
                            icon="angle-left"
                            title={translate('pagination.previousPageTitle', `Go to previous page`)}
                            onClick={handlePreviousPageClick}
                        />
                    )}
                    {displayRange.start > 1 && (
                        <PaginationItem
                            title={translate('pagination.firstPageTitle', `Go to first page`)}
                            onClick={handlePageClick}
                            page={1}
                        />
                    )}
                    {displayRange.hasLessPages && <li className={classes.ellipsis}>…</li>}
                    {displayRange.pages.map(page => (
                        <PaginationItem
                            key={page}
                            selected={currentPage === page}
                            onClick={handlePageClick}
                            title={translate('pagination.page', `Go to page ${page}`, [page])}
                            page={page}
                        />
                    ))}
                    {displayRange.hasMorePages && <li className={classes.ellipsis}>…</li>}
                    {displayRange.end < numberOfPages && (
                        <PaginationItem
                            title={translate('pagination.lastPageTitle', `Go to last page`)}
                            onClick={handlePageClick}
                            page={numberOfPages}
                        />
                    )}
                    {currentPage < numberOfPages && (
                        <PaginationItem
                            icon="angle-right"
                            title={translate('pagination.nextPageTitle', `Go to next page`)}
                            onClick={handleNextPageClick}
                        />
                    )}
                </ol>
            )}
        </nav>
    );
};

export default React.memo(Pagination);
