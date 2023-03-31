import React from 'react';

import classes from './Column.module.css';

const Column: React.FC = ({ children }) => {
    return <div className={classes.column}>{children}</div>;
};

export default Column;
