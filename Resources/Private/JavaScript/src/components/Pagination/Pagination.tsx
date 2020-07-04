import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { ASSETS_PER_PAGE, createUseMediaUiStyles, useIntl } from '../../core';
import { MediaUiTheme } from '../../interfaces';
import { currentPageState } from '../../state';
import { useAssetCountQuery } from '../../hooks';
import { PaginationItem } from './index';

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
    assetCount: {
        height: '100%',
        alignSelf: 'flex-start',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        userSelect: 'none'
    },
    list: {
        display: 'flex',
        justifySelf: 'center',
        listStyleType: 'none',
        textAlign: 'center',
        '& > li': {
            width: '2.4rem',
            userSelect: 'none',
            lineHeight: '2.4rem',
            '& a': {
                display: 'block',
                height: '100%',
                width: '100%',
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: theme.colors.primary,
                    color: 'white'
                }
            }
        }
    },
    selected: {
        border: `1px solid ${theme.colors.border}`,
        borderTop: 0,
        borderBottom: 0,
        '& a': {
            color: theme.colors.primary
        }
    }
}));

export default function Pagination() {
    const classes = useStyles();
    const [currentPage, setCurrentPage] = useRecoilState(currentPageState);
    const { assetCount } = useAssetCountQuery();
    const { translate } = useIntl();

    const numberOfPages = Math.ceil(assetCount / ASSETS_PER_PAGE);
    const maximumNumberOfLinks = 5;
    const [displayRange, setDisplayRange] = useState({
        start: 0,
        end: 0,
        hasLessPages: false,
        hasMorePages: false,
        pages: []
    });

    const handlePageClick = useCallback(page => setCurrentPage(page), [setCurrentPage]);

    // Calculates visible display range
    useEffect(() => {
        const maxLinks = Math.min(maximumNumberOfLinks, numberOfPages);
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
            <div className={classes.assetCount}>
                {assetCount} {translate('pagination.assetCount', 'assets')}
            </div>
            {numberOfPages > 0 && (
                <ol className={classes.list}>
                    {currentPage > 1 && (
                        <PaginationItem
                            icon="angle-left"
                            title={translate('pagination.previousPageTitle', `Go to previous page`)}
                            onClick={handlePageClick}
                            page={currentPage - 1}
                        />
                    )}
                    {displayRange.start > 1 && (
                        <PaginationItem
                            onClick={handlePageClick}
                            title={translate('pagination.firstPageTitle', `Go to first page`)}
                            page={1}
                        />
                    )}
                    {displayRange.hasLessPages && <li>…</li>}
                    {displayRange.pages.map(page => (
                        <PaginationItem
                            key={page}
                            selected={currentPage === page}
                            onClick={handlePageClick}
                            title={translate('pagination.page', `Go to page ${page}`, [page])}
                            page={page}
                        />
                    ))}
                    {displayRange.hasMorePages && <li>…</li>}
                    {displayRange.end < numberOfPages && (
                        <PaginationItem
                            onClick={handlePageClick}
                            title={translate('pagination.lastPageTitle', `Go to last page`)}
                            page={numberOfPages}
                        />
                    )}
                    {currentPage < numberOfPages && (
                        <PaginationItem
                            icon="angle-right"
                            title={translate('pagination.nextPageTitle', `Go to next page`)}
                            onClick={handlePageClick}
                            page={currentPage + 1}
                        />
                    )}
                </ol>
            )}
        </nav>
    );
}
