import * as React from 'react';
import { createUseMediaUiStyles } from '../../../core';
import { MediaUiTheme } from '../../../interfaces';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    inspector: {
        display: 'grid',
        gridAutoRows: 'auto',
        gridGap: theme.spacing.full,
        '& input, & textarea': {
            width: '100%'
        }
    }
}));

const InspectorContainer = ({ children }: { children: React.ReactNode }) => {
    const classes = useStyles();
    return <div className={classes.inspector}>{children}</div>;
};

export default InspectorContainer;
