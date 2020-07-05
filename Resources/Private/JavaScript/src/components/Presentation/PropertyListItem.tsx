import * as React from 'react';

interface PropertyListItemProps {
    label: string;
    value: string;
}

const PropertyListItem: React.FC<PropertyListItemProps> = ({ label, value }: PropertyListItemProps) => {
    return (
        <>
            <dt>{label}</dt>
            <dd>{value}</dd>
        </>
    );
};

export default React.memo(PropertyListItem);
