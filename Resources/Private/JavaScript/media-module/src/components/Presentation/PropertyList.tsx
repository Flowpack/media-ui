import * as React from 'react';

import { createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    propertyList: {
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        '& dt': {
            backgroundColor: theme.colors.alternatingBackground,
            color: 'white',
            fontWeight: 'bold',
            padding: `${theme.spacing.half} ${theme.spacing.half} 0`,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        '& dd': {
            backgroundColor: theme.colors.alternatingBackground,
            color: theme.colors.inactive,
            margin: '0 0 1px',
            padding: theme.spacing.half,
            textOverflow: 'ellipsis',
            overflowX: 'hidden',
            whiteSpace: 'nowrap',
        },
    },
}));

interface PropertyListProps {
    children: React.ReactElement[];
}

const PropertyList: React.FC<PropertyListProps> = ({ children }: PropertyListProps) => {
    const classes = useStyles();

    return <dl className={classes.propertyList}>{children}</dl>;
};

export default React.memo(PropertyList);
