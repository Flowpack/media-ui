import React, { useCallback } from 'react';

import { IconButton } from '@neos-project/react-ui-components';

import { useIntl, useMediaUi, useNotify } from '@media-ui/core';
import { useDeleteAsset } from '@media-ui/core/src/hooks';

const DeleteAssetButton: React.FC<{ asset: Asset; style?: string }> = ({ asset, style = 'transparent' }) => {
    const { translate } = useIntl();
    const { approvalAttainmentStrategy } = useMediaUi();
    const { deleteAsset } = useDeleteAsset();
    const Notify = useNotify();

    const onDeleteAsset = useCallback(
        async (asset: Asset): Promise<boolean> => {
            const canDeleteAsset = await approvalAttainmentStrategy.obtainApprovalToDeleteAsset({
                asset,
            });

            if (canDeleteAsset) {
                try {
                    await deleteAsset({ assetId: asset.id, assetSourceId: asset.assetSource.id });

                    Notify.ok(translate('action.deleteAsset.success', 'The asset has been deleted'));

                    return true;
                } catch ({ message }) {
                    Notify.error(message);
                }
            }

            return false;
        },
        [Notify, translate, deleteAsset, approvalAttainmentStrategy]
    );

    return !asset.assetSource.readOnly ? (
        <IconButton
            title={
                asset.isInUse
                    ? translate('itemActions.delete.disabled', 'Cannot delete an asset that is in use')
                    : translate('itemActions.delete', 'Delete asset')
            }
            disabled={asset.isInUse}
            icon="trash"
            size="regular"
            style={style}
            hoverStyle="error"
            onClick={() => onDeleteAsset(asset)}
        />
    ) : null;
};

export default DeleteAssetButton;
