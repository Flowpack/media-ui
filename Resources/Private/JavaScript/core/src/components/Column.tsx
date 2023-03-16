import React from 'react';

interface ColumnProps {
    children: React.ReactElement | React.ReactElement[];
}

import './Column.module.css';

export default function Column({ children }: ColumnProps) {
    return <div className="column">{children}</div>;
}
