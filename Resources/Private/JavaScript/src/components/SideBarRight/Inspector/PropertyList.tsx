import * as React from 'react';
import { createUseMediaUiStyles } from '../../../core';
import { MediaUiTheme } from '../../../interfaces';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    propertyList: {
        overflow: 'hidden',
        width: '100%',
        '& dt': {
            backgroundColor: theme.alternatingBackgroundColor,
            color: 'white',
            fontWeight: 'bold',
            padding: '8px 8px 0',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        '& dd': {
            backgroundColor: theme.alternatingBackgroundColor,
            color: theme.inactiveColor,
            lineHeight: '1.3',
            margin: '0 0 1px',
            padding: '8px',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        }
    }
}));

interface PropertyListProps {
    children: React.ReactElement[];
}

interface PropertyListItemProps {
    label: string;
    value: string;
}

export function PropertyList({ children }: PropertyListProps) {
    const classes = useStyles();

    return <dl className={classes.propertyList}>{children}</dl>;
}

export function PropertyListItem({ label, value }: PropertyListItemProps) {
    return (
        <>
            <dt>{label}</dt>
            <dd>{value}</dd>
        </>
    );
}
