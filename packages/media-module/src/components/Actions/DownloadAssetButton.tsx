import React from 'react';

import { Icon, IconButton } from '@neos-project/react-ui-components';
import { useIntl } from '@media-ui/core';

interface DownloadAssetButtonProps {
    asset: Asset;
    style?: string;
    size?: 'small' | 'regular';
    variant?: 'button' | 'menuItem';
    menuItemClassName?: string;
}

const DownloadAssetButton: React.FC<DownloadAssetButtonProps> = ({
    asset,
    style = 'transparent',
    size = 'regular',
    variant = 'button',
    menuItemClassName,
}) => {
    const { translate } = useIntl();
    const label = translate('itemActions.download', 'Download asset');

    if (!asset?.file?.url) return null;

    if (variant === 'menuItem') {
        return (
            <li className={menuItemClassName}>
                <a href={asset.file.url} download>
                    <Icon icon="download" />
                    <span>{label}</span>
                </a>
            </li>
        );
    }

    return (
        <a href={asset.file.url} download title={label}>
            <IconButton icon="download" size={size} style={style} hoverStyle="success" />
        </a>
    );
};

export default DownloadAssetButton;
