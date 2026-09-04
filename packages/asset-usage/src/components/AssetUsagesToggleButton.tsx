import React from 'react';
import { useSetRecoilState } from 'recoil';

import { useIntl } from '@media-ui/core';
import { ActionButton } from '@media-ui/core/src/components';
import { useSelectedAsset } from '@media-ui/core/src/hooks';

import assetUsageDetailsModalState from '../state/assetUsageDetailsModalState';

interface AssetUsagesToggleButtonProps {
    hideLabel?: boolean;
    className?: string;
}

const AssetUsagesToggleButton: React.FC<AssetUsagesToggleButtonProps> = ({ hideLabel, className }) => {
    const asset = useSelectedAsset();
    const setAssetUsagesModalOpen = useSetRecoilState(assetUsageDetailsModalState);
    const { translate } = useIntl();
    const disabled = asset?.isInUse === false;
    const label = translate('assetUsageList.toggle', 'Show usages');

    if (!asset) return null;

    return (
        <ActionButton
            icon="link"
            label={label}
            disabled={disabled}
            hideLabel={hideLabel}
            className={className}
            onClick={() => setAssetUsagesModalOpen(true)}
        />
    );
};

export default React.memo(AssetUsagesToggleButton);
