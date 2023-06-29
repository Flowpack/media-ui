import React from 'react';

import PropertyListItem from './PropertyListItem';

import classes from './PropertyList.module.css';

interface PropertyListProps {
    children: React.ReactElement<typeof PropertyListItem>[];
}

const PropertyList: React.FC<PropertyListProps> = ({ children }: PropertyListProps) => {
    return <dl className={classes.propertyList}>{children}</dl>;
};

export default React.memo(PropertyList);
