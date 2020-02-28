import * as React from 'react';
import { ASSETS_PER_PAGE, useMediaUi } from '../core/MediaUi';
import { useIntl } from '../core/Intl';
import { createUseStyles } from 'react-jss';
import { MediaUITheme, useMediaUITheme } from './App';

const usePaginationStyles = createUseStyles((theme: MediaUITheme) => ({
    container: {
        gridArea: props => props.gridPosition,
        display: 'flex'
    },
    selected: {
        fontWeight: 'bold'
    },
    list: {
        display: 'flex',
        margin: '0 -.5rem',
        justifyContent: 'center',
        '.neos & > li': {
            padding: '0 .5rem',
            '& a': {
                cursor: 'pointer',
                userSelect: 'none'
            }
        }
    }
}));

export default function Pagination({ gridPosition }) {
    const theme = useMediaUITheme();
    const classes = usePaginationStyles({ gridPosition, theme });
    const { assetCount, currentPage, setCurrentPage } = useMediaUi();
    const { translate } = useIntl();

    const maxPages = Math.ceil(assetCount / ASSETS_PER_PAGE);

    const handlePageClick = page => setCurrentPage(page);

    return (
        <nav className={classes.container}>
            <ol className={classes.list}>
                {[...Array(maxPages)].map((_, page) => (
                    <li key={page}>
                        <a
                            className={currentPage === page ? classes.selected : null}
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
