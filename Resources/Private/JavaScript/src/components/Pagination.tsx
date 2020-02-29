import * as React from 'react';
import { ASSETS_PER_PAGE, useMediaUi } from '../core/MediaUi';
import { useIntl } from '../core/Intl';
import { createUseStyles } from 'react-jss';
import { useMediaUiTheme } from '../core/MediaUiThemeProvider';

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
                '& a': {
                    display: 'block',
                    height: '2.4rem',
                    width: '2.4rem',
                    lineHeight: '2.4rem',
                    cursor: 'pointer',
                    userSelect: 'none'
                },
                '&:hover': {
                    backgroundColor: theme.primaryColor,
                    '& a': {
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

    const maxPages = Math.ceil(assetCount / ASSETS_PER_PAGE);

    const handlePageClick = page => setCurrentPage(page);

    return (
        <nav className={classes.pagination}>
            <ol className={classes.list}>
                {[...Array(maxPages)].map((_, page) => (
                    <li key={page} className={currentPage === page ? classes.selected : null}>
                        <a
                            onClick={() => handlePageClick(page)}
                            title={translate('Go to page {0}', `Go to page ${page + 1}`, [page + 1])}
                        >
                            {page + 1}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
