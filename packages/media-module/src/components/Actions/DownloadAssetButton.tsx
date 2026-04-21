import React, { useCallback } from 'react';

import { Icon, IconButton } from '@neos-project/react-ui-components';

import { useIntl, useNotify } from '@media-ui/core';
import { useDownloadAssets } from '@media-ui/core/src/hooks';
import { useFailedAssetLabels } from '@media-ui/media-module/src/hooks';

interface DownloadAssetButtonProps {
    assets: (Asset | AssetIdentity)[];
    style?: string;
    size?: 'small' | 'regular';
    variant?: 'button' | 'menuItem';
    menuItemClassName?: string;
    menuItemDisabledClassName?: string;
}

const toIdentity = (asset: Asset | AssetIdentity): AssetIdentity =>
    'assetId' in asset ? asset : { assetId: asset.id, assetSourceId: asset.assetSource.id };

const DownloadAssetButton: React.FC<DownloadAssetButtonProps> = ({
    assets,
    style = 'transparent',
    size = 'regular',
    variant = 'button',
    menuItemClassName,
    menuItemDisabledClassName,
}) => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const { downloadAssets } = useDownloadAssets();
    const { getFailedAssetLabels } = useFailedAssetLabels();

    const isSingle = assets.length === 1;
    const disabled = assets.length === 0;

    const onDownload = useCallback(async () => {
        if (assets.length === 0) return;

        const identities = assets.map(toIdentity);
        const results = await downloadAssets(identities);
        const failedLabels = getFailedAssetLabels(results, identities);

        if (failedLabels.length === 0) {
            if (!isSingle) {
                Notify.ok(translate('action.downloadAssets.success', 'The assets have been downloaded'));
            }
        } else {
            Notify.error(
                translate('action.downloadAssets.error', 'The following assets could not be downloaded:'),
                failedLabels.join(', ')
            );
        }
    }, [assets, isSingle, downloadAssets, getFailedAssetLabels, Notify, translate]);

    const label = isSingle
        ? translate('itemActions.download', 'Download asset')
        : translate('itemActions.downloadMultiple', 'Download assets');

    if (variant === 'menuItem') {
        return (
            <li
                className={`${menuItemClassName}${disabled ? ` ${menuItemDisabledClassName ?? ''}` : ''}`}
                onClick={disabled ? undefined : onDownload}
            >
                <Icon icon="download" />
                <span>{label}</span>
            </li>
        );
    }

    return (
        <IconButton icon="download" size={size} style={style} hoverStyle="success" title={label} onClick={onDownload} />
    );
};

export default DownloadAssetButton;
