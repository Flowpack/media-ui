import * as React from 'react';
import { useMemo } from 'react';

import { createUseMediaUiStyles, MediaUiTheme, useMediaUi } from '@media-ui/core/src';
import { ClipboardActions } from '@media-ui/feature-clipboard/src';

import { SearchBox, TypeFilter, ViewModeSelector } from './index';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    topBar: {
        display: 'flex',
        flexWrap: 'nowrap',
        justifyContent: 'flex-end',
        margin: `0 -${theme.spacing.half}`,
        // Add spacing in selection mode to prevent overlap with close button of secondary inspector view
        paddingRight: (props) => (props.selectionMode ? theme.spacing.goldenUnit : null),
        '& > *': {
            margin: `0 ${theme.spacing.half}`,
        },
    },
}));

const TopBar: React.FC = () => {
    const { selectionMode } = useMediaUi();
    const classes = useStyles({ selectionMode });

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
