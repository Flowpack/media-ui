import React from 'react';

import classes from './InspectorContainer.module.css';

const InspectorContainer: React.FC = ({ children }) => {
    return <div className={classes.inspector}>{children}</div>;
};

export default InspectorContainer;
