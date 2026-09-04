import React, { useCallback } from 'react';

import { useIntl, useMediaUi, useNotify } from '@media-ui/core';
import { ActionButton } from '@media-ui/core/src/components';
import { useDeleteAsset } from '@media-ui/core/src/hooks';
import { useFailedAssetLabels } from '@media-ui/media-module/src/hooks';

interface DeleteAssetButtonProps {
    asset?: Asset;
    assets?: AssetIdentity[];
    hideLabel?: boolean;
    className?: string;
}

const DeleteAssetButton: React.FC<DeleteAssetButtonProps> = ({ asset, assets, hideLabel, className }) => {
    const { translate } = useIntl();
    const { approvalAttainmentStrategy } = useMediaUi();
    const { deleteAsset } = useDeleteAsset();
    const { getFailedAssetLabels } = useFailedAssetLabels();
    const Notify = useNotify();

    const isSingle = !assets && !!asset;
    const disabled = isSingle ? asset.isInUse : assets?.length === 0;

    const onDelete = useCallback(async (): Promise<boolean> => {
        let identities: AssetIdentity[];
        if (assets) {
            identities = assets;
        } else if (asset) {
            identities = [{ assetId: asset.id, assetSourceId: asset.assetSource.id }];
        } else {
            return false;
        }

        const canDelete = isSingle
            ? await approvalAttainmentStrategy.obtainApprovalToDeleteAsset({ asset })
            : await approvalAttainmentStrategy.obtainApprovalToDeleteAssets({ assets: identities });

        if (!canDelete) return false;

        if (isSingle) {
            try {
                await deleteAsset(identities[0]);
                Notify.ok(translate('action.deleteAsset.success', 'The asset has been deleted'));
                return true;
            } catch (error: any) {
                Notify.error(
                    translate('action.deleteAsset.error', 'Error while trying to delete the asset'),
                    error?.message
                );
                return false;
            }
        }

        // Multi-asset process
        const results = await Promise.allSettled(identities.map((identity) => deleteAsset(identity)));
        const failedLabels = getFailedAssetLabels(results, identities);

        if (failedLabels.length === 0) {
            Notify.ok(translate('action.deleteAssets.success', 'The assets have been deleted'));
            return true;
        }

        Notify.error(
            translate('action.deleteAssets.error', 'Error while trying to delete the assets'),
            failedLabels.join(', ')
        );
        return false;
    }, [asset, assets, isSingle, Notify, translate, deleteAsset, approvalAttainmentStrategy, getFailedAssetLabels]);

    if (isSingle && asset.assetSource.readOnly) return null;

    const label = isSingle
        ? translate('itemActions.delete', 'Delete asset')
        : translate('itemActions.deleteMultiple', 'Delete assets');
    const title = disabled ? translate('itemActions.delete.disabled', 'Cannot delete an asset that is in use') : label;

    // TODO: When multi-select is implemented, check isInUse per asset and readOnly per asset source
    return (
        <ActionButton
            icon="trash"
            label={label}
            title={title}
            disabled={disabled}
            hideLabel={hideLabel}
            className={className}
            onClick={onDelete}
        />
    );
};

export default DeleteAssetButton;
