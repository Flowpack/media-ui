import * as React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { useRecoilValue } from 'recoil';

import { SideBarLeft, UploadDialog } from './SideBarLeft';
import { SideBarRight } from './SideBarRight';
import { Pagination } from './Pagination';
import { createUseMediaUiStyles, useMediaUi } from '../core';
import LoadingIndicator from './LoadingIndicator';
import { MediaUiTheme } from '../interfaces';
import { VIEW_MODE_SELECTION } from '../queries';
import { TopBar } from './TopBar';
import { ListView, ThumbnailView } from './Main';
import { VIEW_MODES } from '../hooks';
import AssetPreview from './AssetPreview';
import { uploadDialogState } from '../state';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    container: ({ selectionMode }) => ({
        display: 'grid',
        // TODO: Find a way to not calculate height to allow scrolling in main grid area
        height: `calc(100vh - 40px * 4 - 21px)`,
        gridTemplateRows: '40px 1fr',
        gridTemplateColumns: selectionMode
            ? theme.size.sidebarWidth + ' 1fr'
            : theme.size.sidebarWidth + ' 1fr ' + theme.size.sidebarWidth,
        gridTemplateAreas: selectionMode
            ? `
            "left top"
            "left main"
        `
            : `
            "left top right"
            "left main right"
        `,
        gridGap: theme.spacing.full,
        lineHeight: 1.5
    }),
    gridColumn: {
        height: '100%',
        overflowY: 'auto'
    },
    gridRight: {
        extend: 'gridColumn',
        gridArea: 'right'
    },
    gridLeft: {
        extend: 'gridColumn',
        gridArea: 'left'
    },
    gridMain: {
        extend: 'gridColumn',
        gridArea: 'main'
    },
    gridTop: {
        gridArea: 'top'
    },
    '@global': {
        '#media-ui-app': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${theme.colors.scrollbarForeground} ${theme.colors.scrollbarBackground}`,

            '& ::-webkit-scrollbar': {
                width: theme.size.scrollbarSize
            },
            '& ::-webkit-scrollbar-track': {
                background: theme.colors.scrollbarBackground
            },
            '& ::-webkit-scrollbar-thumb': {
                backgroundColor: theme.colors.scrollbarForeground
            }
        }
    }
}));

const App: React.FC = () => {
    const { selectionMode, containerRef } = useMediaUi();
    const { visible: showUploadDialog } = useRecoilValue(uploadDialogState);
    const classes = useStyles({ selectionMode });

    const viewModeSelectionQuery = useQuery(VIEW_MODE_SELECTION);
    const { viewModeSelection } = viewModeSelectionQuery.data;

    return (
        <div className={classes.container} ref={containerRef}>
            <LoadingIndicator />

            <div className={classes.gridLeft}>
                <SideBarLeft />
            </div>

            <div className={classes.gridTop}>
                <TopBar />
            </div>

            <div className={classes.gridMain}>
                {viewModeSelection === VIEW_MODES.List ? <ListView /> : <ThumbnailView />}
            </div>

            <Pagination />

            {!selectionMode && (
                <div className={classes.gridRight}>
                    <SideBarRight />
                </div>
            )}

            <AssetPreview />
            {showUploadDialog && <UploadDialog />}
        </div>
    );
};

export default React.memo(App);
