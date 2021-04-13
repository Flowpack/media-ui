import * as React from 'react';
import { useMemo } from 'react';

import { IconButton } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core/src';
import { AssetIdentity } from '@media-ui/core/src/interfaces';
import { useClipboard } from '@media-ui/feature-clipboard/src';

interface MissingAssetActionsProps {
    assetIdentity: AssetIdentity;
}

const MissingAssetActions: React.FC<MissingAssetActionsProps> = ({ assetIdentity }: MissingAssetActionsProps) => {
    const { translate } = useIntl();
    const { clipboard, addOrRemoveFromClipboard } = useClipboard();

    const isInClipboard = useMemo(() => {
        return !!clipboard.find(({ assetId }) => assetId === assetIdentity.assetId);
    }, [assetIdentity.assetId, clipboard]);

    // Skip rendering if it's not in the clipboard as we only have one possible action currently
    if (!isInClipboard) return null;

    return (
        <IconButton
            title={translate('itemActions.removeFromClipboard', 'Remove from clipboard')}
            icon="trash"
            size="regular"
            style="transparent"
            hoverStyle="warn"
            onClick={() => addOrRemoveFromClipboard(assetIdentity)}
        />
    );
};

export default React.memo(MissingAssetActions);
