import * as React from 'react';
import { Label } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles } from '@media-ui/core';

const useStyles = createUseMediaUiStyles({
    propertyGroup: {},
});

const Property = ({ children, label }: { children: React.ReactNode; label: React.ReactNode }) => {
    const classes = useStyles();
    return (
        <div className={classes.propertyGroup}>
            <Label>{label}</Label>
            {children}
        </div>
    );
};

export default Property;
