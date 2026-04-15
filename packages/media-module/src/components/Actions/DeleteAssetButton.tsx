import React, { useCallback } from 'react';

import { Icon, IconButton } from '@neos-project/react-ui-components';

import { useIntl, useMediaUi, useNotify } from '@media-ui/core';
import { useDeleteAsset } from '@media-ui/core/src/hooks';

interface DeleteAssetButtonProps {
    asset?: Asset;
    assets?: AssetIdentity[];
    style?: string;
    size?: 'small' | 'regular';
    variant?: 'button' | 'menuItem';
    menuItemClassName?: string;
    menuItemDisabledClassName?: string;
}

const DeleteAssetButton: React.FC<DeleteAssetButtonProps> = ({
    asset,
    assets,
    style = 'transparent',
    size = 'regular',
    variant = 'button',
    menuItemClassName,
    menuItemDisabledClassName,
}) => {
    const { translate } = useIntl();
    const { approvalAttainmentStrategy } = useMediaUi();
    const { deleteAsset } = useDeleteAsset();
    const Notify = useNotify();

    const isSingle = !assets && !!asset;
    const disabled = isSingle ? asset.isInUse : assets?.length === 0;

    const onDelete = useCallback(async (): Promise<boolean> => {
        const identities: AssetIdentity[] = assets ?? [{ assetId: asset.id, assetSourceId: asset.assetSource.id }];

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

    const label =
        isSingle && asset.isInUse
            ? translate('itemActions.delete.disabled', 'Cannot delete an asset that is in use')
            : isSingle
            ? translate('itemActions.delete', 'Delete asset')
            : translate('itemActions.deleteMultiple', 'Delete assets');

    if (variant === 'menuItem') {
        return (
            <li
                className={`${menuItemClassName}${disabled ? ` ${menuItemDisabledClassName}` : ''}`}
                onClick={disabled ? undefined : onDelete}
            >
                <Icon icon="trash" />
                <span>{label}</span>
            </li>
        );
    }

    // TODO: When multi-select is implemented, check isInUse per asset and readOnly per asset source
    return (
        <IconButton
            title={label}
            disabled={disabled}
            icon="trash"
            size={size}
            style={style}
            hoverStyle="error"
            onClick={onDelete}
        />
    );
};

export default DeleteAssetButton;
