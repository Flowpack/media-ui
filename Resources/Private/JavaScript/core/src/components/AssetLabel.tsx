import * as React from 'react';

interface AssetLabelProps {
    label: string;
}

import './AssetLabel.module.css';

const AssetLabel: React.FC<AssetLabelProps> = ({ label }: AssetLabelProps) => {
    return <span className="assetLabel">{label}</span>;
};

export default React.memo(AssetLabel);
