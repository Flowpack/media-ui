import React from 'react';

import { useIntl } from '@media-ui/core';
import { ActionButton } from '@media-ui/core/src/components';

interface OpenAssetInNewTabButtonProps {
    asset: Asset;
    hideLabel?: boolean;
    className?: string;
}

const OpenAssetInNewTabButton: React.FC<OpenAssetInNewTabButtonProps> = ({ asset, hideLabel, className }) => {
    const { translate } = useIntl();

    if (!asset.file?.url) return null;

    const label = translate('itemActions.openInNewTab', 'Open asset in a new browser tab');

    const onOpenInNewTab = () => {
        window.open(asset.file?.url, '_blank', 'noopener,noreferrer');
    };

    return (
        <ActionButton
            icon="external-link-alt"
            label={label}
            hideLabel={hideLabel}
            className={className}
            onClick={onOpenInNewTab}
        />
    );
};

export default React.memo(OpenAssetInNewTabButton);
