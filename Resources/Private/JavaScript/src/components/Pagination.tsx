import * as React from 'react';
import { ASSETS_PER_PAGE, useMediaUi } from '../core/MediaUi';
import { useIntl } from '../core/Intl';
import { createUseStyles } from 'react-jss';
import { useMediaUiTheme } from '../core/MediaUiThemeProvider';
import { useEffect, useState } from 'react';

const useStyles = createUseStyles({
    pagination: ({ theme }) => ({
        display: 'flex',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: `1px solid ${theme.borderColor}`,
        backgroundColor: theme.moduleBackgroundColor
    }),
    selected: ({ theme }) => ({
        border: `1px solid ${theme.borderColor}`,
        borderTop: 0,
        borderBottom: 0,
        '.neos & a': {
            color: theme.primaryColor
        }
    }),
    list: ({ theme }) => ({
        '.neos &': {
            display: 'flex',
            margin: '0 -.5rem',
            justifyContent: 'center',
            textAlign: 'center',
            '& > li': {
                width: '2.4rem',
                userSelect: 'none',
                lineHeight: '2.4rem',
                '& a': {
                    display: 'block',
                    height: '2.4rem',
                    width: '2.4rem',
                    cursor: 'pointer',
                    '&:hover': {
                        backgroundColor: theme.primaryColor,
                        color: 'white'
                    }
                }
            }
        }
    })
});

export default function Pagination() {
    const theme = useMediaUiTheme();
    const classes = useStyles({ theme });
    const { assetCount, currentPage, setCurrentPage } = useMediaUi();
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

    const handlePageClick = page => setCurrentPage(page);

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
        <>
            {numberOfPages > 0 && (
                <nav className={classes.pagination}>
                    <ol className={classes.list}>
                        {currentPage > 1 && (
                            <li>
                                <a
                                    onClick={() => handlePageClick(currentPage - 1)}
                                    title={translate('pagination.previousPageTitle', `Go to previous page`)}
                                >
                                    &lsaquo;
                                </a>
                            </li>
                        )}
                        {displayRange.start > 1 && (
                            <li>
                                <a
                                    onClick={() => handlePageClick(1)}
                                    title={translate('pagination.firstPageTitle', `Go to first page`)}
                                >
                                    1
                                </a>
                            </li>
                        )}
                        {displayRange.hasLessPages && <li>…</li>}
                        {displayRange.pages.map(page => (
                            <li key={page} className={currentPage === page ? classes.selected : null}>
                                <a
                                    onClick={() => handlePageClick(page)}
                                    title={translate('pagination.page', `Go to page ${page}`, [page])}
                                >
                                    {page}
                                </a>
                            </li>
                        ))}
                        {displayRange.hasMorePages && <li>…</li>}
                        {displayRange.end < numberOfPages && (
                            <li>
                                <a
                                    onClick={() => handlePageClick(numberOfPages)}
                                    title={translate('pagination.lastPageTitle', `Go to last page`)}
                                >
                                    {numberOfPages}
                                </a>
                            </li>
                        )}
                        {currentPage < numberOfPages && (
                            <li>
                                <a
                                    onClick={() => handlePageClick(currentPage + 1)}
                                    title={translate('pagination.nextPageTitle', `Go to next page`)}
                                >
                                    &rsaquo;
                                </a>
                            </li>
                        )}
                    </ol>
                </nav>
            )}
        </>
    );
}
