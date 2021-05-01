import * as React from 'react';

export default interface TreeNodeProps {
    title?: string;
    label?: string;
    onClick: ([string]: any) => void;
    level: number;
    isActive: boolean;
    children?: React.ReactElement[];
    collapsedByDefault?: boolean;
}
