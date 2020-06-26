import * as React from 'react';
import { ReactElement } from 'react';

import { createUseMediaUiStyles } from '../../core';
import { MediaUiTheme } from '../../interfaces';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    column: {
        display: 'grid',
        gridAutoRows: 'min-content',
        gridGap: theme.spacing.full,
        overflowY: 'auto'
    }
}));

interface ColumnProps {
    children: ReactElement | ReactElement[];
}

export default function Column({ children }: ColumnProps) {
    const classes = useStyles();

    return <div className={classes.column}>{children}</div>;
}
