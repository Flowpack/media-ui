import React from 'react';
import { Label } from '@neos-project/react-ui-components';
import classes from './Property.module.css';

const Property: React.FC<{ label: React.ReactNode; isCheckbox?: boolean }> = ({ children, label, isCheckbox }) => {
    return (
        <>
            {isCheckbox ? (
                <div className={'propertyGroup ' + classes.propertyGroupRow}>
                    <Label>
                        {children}
                        <div className={classes.propertyGroupLabel}>{label}</div>
                    </Label>
                </div>
            ) : (
                <div className="propertyGroup">
                    <Label>{label}</Label>
                    {children}
                </div>
            )}
        </>
    );
};

export default Property;
