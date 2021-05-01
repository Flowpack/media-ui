import * as React from 'react';

import { createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    inspector: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gridAutoRows: 'auto',
        gridGap: theme.spacing.full,
        '& input, & textarea': {
            width: '100%',
        },
    },
}));

const InspectorContainer = ({ children }: { children: React.ReactNode }) => {
    const classes = useStyles();
    return <div className={classes.inspector}>{children}</div>;
};

export default InspectorContainer;
