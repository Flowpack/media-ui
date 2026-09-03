import React from 'react';
import { useRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { useSelectedAsset } from '@media-ui/core/src/hooks';

import assetUsageDetailsModalState from '../state/assetUsageDetailsModalState';

interface AssetUsagesToggleButtonProps {
    variant?: 'button' | 'menuItem';
    menuItemClassName?: string;
    menuItemDisabledClassName?: string;
}

const AssetUsagesToggleButton: React.FC<AssetUsagesToggleButtonProps> = ({
    variant = 'button',
    menuItemClassName,
    menuItemDisabledClassName,
}) => {
    const asset = useSelectedAsset();
    const [assetUsagesModalOpen, setAssetUsagesModalOpen] = useRecoilState(assetUsageDetailsModalState);
    const { translate } = useIntl();
    const disabled = asset?.isInUse === false;
    const label = translate('assetUsageList.toggle', 'Show usages');

    if (variant === 'menuItem') {
        return (
            <li
                className={`${menuItemClassName}${disabled ? ` ${menuItemDisabledClassName}` : ''}`}
                onClick={disabled ? undefined : () => setAssetUsagesModalOpen(true)}
            >
                <Icon icon="link" />
                <span>{label}</span>
            </li>
        );
    }

    return asset ? (
        <Button
            disabled={disabled}
            size="regular"
            style={assetUsagesModalOpen ? 'brand' : 'lighter'}
            hoverStyle="brand"
            onClick={() => setAssetUsagesModalOpen(true)}
            title={label}
        >
            <Icon icon="link" />
        </Button>
    ) : null;
};

export default React.memo(AssetUsagesToggleButton);
