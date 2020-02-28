import * as React from 'react';
import { ASSETS_PER_PAGE, useMediaUi } from '../core/MediaUi';
import { useIntl } from '../core/Intl';
import { createUseStyles } from 'react-jss';
import { MediaUITheme, useMediaUITheme } from './App';

const usePaginationStyles = createUseStyles((theme: MediaUITheme) => ({
    container: {
        gridArea: props => props.gridPosition
    },
    selected: {
        fontWeight: 'bold'
    }
}));

export default function Pagination({ gridPosition }) {
    const theme = useMediaUITheme();
    const classes = usePaginationStyles({ gridPosition, theme });
    const { assetProxies, currentPage, setCurrentPage } = useMediaUi();
    const { translate } = useIntl();

    const maxPages = assetProxies.length / ASSETS_PER_PAGE;

    const handlePageClick = page => setCurrentPage(page);

    return (
        <nav>
            <ol>
                {[...Array(maxPages)].map((_, page) => (
                    <li key={page}>
                        <a
                            className={currentPage === page ? classes.selected : null}
                            onClick={() => handlePageClick(page)}
                            title={translate('Go to page {0}')}
                        >
                            {page}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
