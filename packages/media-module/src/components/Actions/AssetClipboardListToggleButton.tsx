import React from 'react';
import { useRecoilState } from 'recoil';

import { useIntl } from '@media-ui/core';
import { ActionButton } from '@media-ui/core/src/components';
import { clipboardItemsState } from '@media-ui/feature-clipboard';

interface AssetClipboardListToggleButtonProps {
    assetSourceId: AssetSourceId;
    hideLabel?: boolean;
    className?: string;
}

const AssetClipboardListToggleButton: React.FC<AssetClipboardListToggleButtonProps> = ({
    assetSourceId,
    hideLabel,
    className,
}) => {
    const { translate } = useIntl();
    const [allInClipboard, toggleAllClipboardState] = useRecoilState(clipboardItemsState(assetSourceId));

    const label = allInClipboard
        ? translate('itemActions.removeAllFromClipboard', 'Remove all from clipboard')
        : translate('itemActions.copyAllToClipboard', 'Copy all to clipboard');

    return (
        <ActionButton
            icon={allInClipboard ? 'clipboard-check' : 'clipboard'}
            label={label}
            hideLabel={hideLabel}
            className={className}
            onClick={() => toggleAllClipboardState(!allInClipboard)}
        />
    );
};

export default React.memo(AssetClipboardListToggleButton);
