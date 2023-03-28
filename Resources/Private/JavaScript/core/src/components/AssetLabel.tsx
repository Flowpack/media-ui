import * as React from 'react';

interface AssetLabelProps {
    label: string;
}

import classes from './AssetLabel.module.css';

const AssetLabel: React.FC<AssetLabelProps> = ({ label }: AssetLabelProps) => {
    return <span className={classes.assetLabel}>{label}</span>;
};

export default React.memo(AssetLabel);
