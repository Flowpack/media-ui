import React from 'react';
import { useRecoilState } from 'recoil';

import { IconButton } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { clipboardItemState } from '@media-ui/feature-clipboard';

interface MissingAssetActionsProps {
    assetIdentity: AssetIdentity;
}

const MissingAssetActions: React.FC<MissingAssetActionsProps> = ({ assetIdentity }: MissingAssetActionsProps) => {
    const { translate } = useIntl();
    const [inClipboard, toggleClipboardState] = useRecoilState(clipboardItemState(assetIdentity));

    // Skip rendering if it's not in the clipboard as we only have one possible action currently
    if (!inClipboard) return null;

    return (
        <IconButton
            title={translate('itemActions.removeFromClipboard', 'Remove from clipboard')}
            icon="trash"
            size="regular"
            style="transparent"
            hoverStyle="warn"
            onClick={toggleClipboardState}
        />
    );
};

export default React.memo(MissingAssetActions);
