import React from 'react';

interface ColumnProps {
    children: React.ReactElement | React.ReactElement[];
}

import classes from './Column.module.css';

export default function Column({ children }: ColumnProps) {
    return <div className={classes.column}>{children}</div>;
}
