import React, { useCallback, useRef } from 'react';

interface PropertyListItemProps {
    label: string;
    value: string;
}

const PropertyListItem: React.FC<PropertyListItemProps> = ({ label, value }: PropertyListItemProps) => {
    const ref = useRef<HTMLElement>(null);
    const handleClick = useCallback(() => {
        ref.current && window.getSelection().selectAllChildren(ref.current);
    }, [ref]);

    return (
        <>
            <dt>{label}</dt>
            <dd title={value} ref={ref} onClick={handleClick}>
                {value}
            </dd>
        </>
    );
};

export default React.memo(PropertyListItem);
