import * as React from 'react';
import { useMemo } from 'react';

import { createUseMediaUiStyles, MediaUiTheme, useMediaUi } from '@media-ui/core/src';
import { ClipboardToggle } from '@media-ui/feature-clipboard/src';

import AssetCount from './AssetCount/AssetCount';
import Pagination from './Pagination/Pagination';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    bottomBar: ({ isInNodeCreationDialog, selectionMode }) => ({
        display: 'grid',
        gridTemplateColumns: isInNodeCreationDialog || selectionMode ? 'repeat(3, 1fr)' : '350px 1fr 350px',
        gridGap: theme.spacing.goldenUnit,
        position: 'fixed',
        bottom: isInNodeCreationDialog ? -16 : 0,
        left: isInNodeCreationDialog ? -16 : 0,
        right: isInNodeCreationDialog ? -16 : 0,
        borderTop: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.moduleBackground,
        zIndex: theme.paginationZIndex,
    }),
}));

const BottomBar: React.FC = () => {
    const { isInNodeCreationDialog, selectionMode } = useMediaUi();
    const classes = useStyles({ isInNodeCreationDialog, selectionMode });

    const components = useMemo(() => [AssetCount, Pagination, ClipboardToggle], []);

    return (
        <div className={classes.bottomBar}>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
};

export default React.memo(BottomBar);
