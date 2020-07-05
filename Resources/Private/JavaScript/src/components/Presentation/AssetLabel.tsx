import * as React from 'react';

import { createUseMediaUiStyles } from '../../core';

const useStyles = createUseMediaUiStyles({
    assetLabel: {
        display: 'inline-block',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    }
});

interface AssetLabelProps {
    label: string;
}

const AssetLabel: React.FC<AssetLabelProps> = ({ label }: AssetLabelProps) => {
    const classes = useStyles();

    return <span className={classes.assetLabel}>{label}</span>;
};

export default React.memo(AssetLabel);
