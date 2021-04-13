import * as React from 'react';
import { useMemo } from 'react';

import { createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';
import { Clipboard } from '@media-ui/feature-clipboard/src';

import AssetCount from './AssetCount/AssetCount';
import Pagination from './Pagination/Pagination';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    bottomBar: {
        display: 'grid',
        gridTemplateColumns: '350px 1fr 350px',
        gridGap: theme.spacing.goldenUnit,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.moduleBackground,
        zIndex: theme.paginationZIndex,
    },
}));

const BottomBar: React.FC = () => {
    const classes = useStyles();

    const components = useMemo(() => [AssetCount, Pagination, Clipboard], []);

    return (
        <div className={classes.bottomBar}>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
};

export default React.memo(BottomBar);
