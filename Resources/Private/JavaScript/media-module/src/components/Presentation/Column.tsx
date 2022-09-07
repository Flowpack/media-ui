import * as React from 'react';
import { ReactElement } from 'react';

import { createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    column: {
        display: 'grid',
        gridAutoRows: 'minmax(0, min-content)',
        gridGap: theme.spacing.full,
        overflowY: 'auto',
        overflowX: 'hidden',
        height: '100%',
    },
}));

interface ColumnProps {
    children: ReactElement | ReactElement[];
}

export default function Column({ children }: ColumnProps) {
    const classes = useStyles();

    return <div className={classes.column}>{children}</div>;
}
