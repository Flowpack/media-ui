import React from 'react';
import { useRecoilState } from 'recoil';
import cx from 'classnames';

import { useIntl } from '@media-ui/core';
import { ActionButton } from '@media-ui/core/src/components';
import { clipboardItemState } from '@media-ui/feature-clipboard';

interface AssetClipboardToggleButtonProps {
    asset: Asset;
    hideLabel?: boolean;
    className?: string;
}

const AssetClipboardToggleButton: React.FC<AssetClipboardToggleButtonProps> = ({ asset, hideLabel, className }) => {
    const { translate } = useIntl();
    const [isInClipboard, toggleClipboardState] = useRecoilState(
        clipboardItemState({ assetId: asset.id, assetSourceId: asset.assetSource.id })
    );

    const label = isInClipboard
        ? translate('itemActions.removeFromClipboard', 'Remove from clipboard')
        : translate('itemActions.copyToClipboard', 'Copy to clipboard');

    return (
        <ActionButton
            icon={isInClipboard ? 'clipboard-check' : 'clipboard'}
            label={label}
            hideLabel={hideLabel}
            className={cx(className, isInClipboard && 'button--active')}
            onClick={() => toggleClipboardState(!isInClipboard)}
        />
    );
};

export default React.memo(AssetClipboardToggleButton);
