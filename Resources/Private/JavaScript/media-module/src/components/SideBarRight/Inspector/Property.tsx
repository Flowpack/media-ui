import React from 'react';
import { Label } from '@neos-project/react-ui-components';

const Property: React.FC<{ label: React.ReactNode; className?: string }> = ({ children, label, className }) => {
    return (
        <div className={className ? 'propertyGroup' + ' ' + className : 'propertyGroup'}>
            <Label>{label}</Label>
            {children}
        </div>
    );
};

export default Property;
