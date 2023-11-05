import React from 'react';
import { useRecoilState } from 'recoil';

import { Badge, Button, Icon } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { useSelectedAsset } from '@media-ui/core/src/hooks';

import assetUsageDetailsModalState from '../state/assetUsageDetailsModalState';
import useAssetUsagesQuery from '@media-ui/feature-asset-usage/src/hooks/useAssetUsages';

import classes from './AssetUsagesToggleButton.module.css';

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
    const { assetUsageDetails } = useAssetUsagesQuery(
        asset ? { assetId: asset.id, assetSourceId: asset.assetSource.id } : null
    );
    const [assetUsagesModalOpen, setAssetUsagesModalOpen] = useRecoilState(assetUsageDetailsModalState);
    const { translate } = useIntl();
    const disabled = asset.isInUse === false;
    const label = translate('assetUsageList.toggle', 'Show usages');

    if (variant === 'menuItem') {
        return (
            <li
                className={`${menuItemClassName}${disabled ? ` ${menuItemDisabledClassName}` : ''}`}
                onClick={disabled ? undefined : () => setAssetUsagesModalOpen(true)}
            >
                <Icon icon="link" />
                <span>{label}</span>
                {assetUsageDetails?.[0]?.usages ? (
                    <Badge label={assetUsageDetails[0].usages.length} className={classes.assetUsageBadge} />
                ) : (
                    ''
                )}
            </li>
        );
    }

    return (
        <Button
            disabled={disabled}
            size="regular"
            style={assetUsagesModalOpen ? 'brand' : 'lighter'}
            hoverStyle="brand"
            onClick={() => setAssetUsagesModalOpen(true)}
            title={label}
        >
            <Icon icon="link" />
            {assetUsageDetails?.[0]?.usages ? (
                <Badge label={assetUsageDetails[0].usages.length} className={classes.assetUsageBadge} />
            ) : (
                ''
            )}
        </Button>
    );
};

export default React.memo(AssetUsagesToggleButton);
