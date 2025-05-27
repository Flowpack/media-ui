import React from 'react';
import { Label } from '@neos-project/react-ui-components';

const Property: React.FC<{ label: React.ReactNode }> = ({ children, label }) => {
    return (
        <div className="propertyGroup">
            <Label>{label}</Label>
            {children}
        </div>
    );
};

export default Property;
