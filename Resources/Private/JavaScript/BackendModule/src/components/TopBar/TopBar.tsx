import * as React from 'react';
import { useMemo } from 'react';

import { createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';
import { ClipboardActions } from '@media-ui/feature-clipboard/src';

import { SearchBox, TypeFilter, ViewModeSelector } from './index';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    topBar: {
        display: 'grid',
        gridTemplateColumns: 'repeat( auto-fit, minmax(200px, 1fr) )',
        gridGap: theme.spacing.goldenUnit,
    },
}));

const TopBar: React.FC = () => {
    const classes = useStyles();

    const components = useMemo(() => [ClipboardActions, SearchBox, TypeFilter, ViewModeSelector], []);

    return (
        <div className={classes.topBar}>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </div>
    );
};

export default React.memo(TopBar);
