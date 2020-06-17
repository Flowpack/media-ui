import * as React from 'react';
import { createUseMediaUiStyles } from '../../../core';
import { MediaUiTheme } from '../../../interfaces';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    propertyList: {
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        '& dt': {
            backgroundColor: theme.colors.alternatingBackground,
            color: 'white',
            fontWeight: 'bold',
            padding: '8px 8px 0',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        '& dd': {
            backgroundColor: theme.colors.alternatingBackground,
            color: theme.colors.inactive,
            margin: '0 0 1px',
            padding: theme.spacing.half,
            textOverflow: 'ellipsis',
            overflowX: 'hidden',
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
