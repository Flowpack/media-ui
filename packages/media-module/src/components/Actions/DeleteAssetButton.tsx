import React, { useCallback } from 'react';

import { IconButton } from '@neos-project/react-ui-components';

import { useIntl, useMediaUi, useNotify } from '@media-ui/core';
import { useDeleteAsset } from '@media-ui/core/src/hooks';

interface DeleteAssetButtonProps {
    asset?: Asset;
    assets?: AssetIdentity[];
    style?: string;
    size?: 'small' | 'regular';
}

const DeleteAssetButton: React.FC<DeleteAssetButtonProps> = ({
    asset,
    assets,
    style = 'transparent',
    size = 'regular',
}) => {
    const { translate } = useIntl();
    const { approvalAttainmentStrategy } = useMediaUi();
    const { deleteAsset } = useDeleteAsset();
    const Notify = useNotify();

    const isSingle = !assets && !!asset;

    const onDelete = useCallback(async (): Promise<boolean> => {
        const identities: AssetIdentity[] = assets ?? [
            { assetId: asset.id, assetSourceId: asset.assetSource.id },
        ];

        const canDelete = isSingle
            ? await approvalAttainmentStrategy.obtainApprovalToDeleteAsset({ asset })
            : await approvalAttainmentStrategy.obtainApprovalToDeleteAssets({ assets: identities });

        if (!canDelete) return false;

        try {
            await Promise.all(identities.map((identity) => deleteAsset(identity)));
            Notify.ok(
                isSingle
                    ? translate('action.deleteAsset.success', 'The asset has been deleted')
                    : translate('action.deleteAssets.success', 'The assets have been deleted')
            );
            return true;
        } catch ({ message }) {
            Notify.error(
                isSingle
                    ? translate('action.deleteAsset.error', 'Error while trying to delete the asset')
                    : translate('action.deleteAssets.error', 'Error while trying to delete the assets'),
                message
            );
        }

        return false;
    }, [asset, assets, isSingle, Notify, translate, deleteAsset, approvalAttainmentStrategy]);

    if (isSingle && asset.assetSource.readOnly) return null;

    // TODO: When multi-select is implemented, check isInUse per asset and readOnly per asset source
    return (
        <IconButton
            title={
                isSingle && asset.isInUse
                    ? translate('itemActions.delete.disabled', 'Cannot delete an asset that is in use')
                    : isSingle
                      ? translate('itemActions.delete', 'Delete asset')
                      : translate('itemActions.deleteMultiple', 'Delete assets')
            }
            disabled={isSingle ? asset.isInUse : assets.length === 0}
            icon="trash"
            size={size}
            style={style}
            hoverStyle="error"
            onClick={onDelete}
        />
    );
};

export default DeleteAssetButton;
