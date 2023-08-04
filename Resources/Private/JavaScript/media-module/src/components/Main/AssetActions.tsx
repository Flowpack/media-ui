import React, { useCallback } from 'react';
import { useSetRecoilState, useRecoilState } from 'recoil';

import { IconButton } from '@neos-project/react-ui-components';

import { useIntl, useMediaUi, useNotify } from '@media-ui/core';
import { useDeleteAsset, useImportAsset } from '@media-ui/core/src/hooks';
import { selectedAssetForPreviewState } from '@media-ui/feature-asset-preview';
import { clipboardItemState } from '@media-ui/feature-clipboard';

interface ItemActionsProps {
    asset: Asset;
}

const AssetActions: React.FC<ItemActionsProps> = ({ asset }: ItemActionsProps) => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const { approvalAttainmentStrategy } = useMediaUi();
    const setSelectedAssetForPreview = useSetRecoilState(selectedAssetForPreviewState);
    const { importAsset } = useImportAsset();
    const { deleteAsset } = useDeleteAsset();
    const [isInClipboard, toggleClipboardState] = useRecoilState(
        clipboardItemState({ assetId: asset.id, assetSourceId: asset.assetSource.id })
    );

    // TODO: Optimize rendering this component when hooks change, as it takes quite a bit of time
    const onImportAsset = useCallback(() => {
        importAsset({ assetId: asset.id, assetSourceId: asset.assetSource.id })
            .then(() => {
                Notify.ok(translate('assetActions.import.success', 'Asset was successfully imported'));
            })
            .catch((error) => {
                Notify.error(translate('assetActions.import.error', 'Failed to import asset'), error.message);
            });
    }, [importAsset, asset, Notify, translate]);

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
                    Notify.error(
                        translate('action.deleteAsset.error', 'Error while trying to delete the asset'),
                        message
                    );
                }
            }

            return false;
        },
        [Notify, translate, deleteAsset, approvalAttainmentStrategy]
    );

    if (!asset) return null;

    return (
        <>
            <IconButton
                title={translate('itemActions.preview', 'Preview asset')}
                icon="expand-alt"
                size="regular"
                style="neutral"
                hoverStyle="brand"
                onClick={() => setSelectedAssetForPreview({ assetId: asset.id, assetSourceId: asset.assetSource.id })}
            />
            {!asset.imported && !asset.localId && (
                <IconButton
                    title={translate('itemActions.import', 'Import asset')}
                    icon="cloud-download-alt"
                    size="regular"
                    style="neutral"
                    hoverStyle="brand"
                    onClick={onImportAsset}
                />
            )}
            {!asset.assetSource.readOnly && (
                <IconButton
                    title={
                        asset.isInUse
                            ? translate('itemActions.delete.disabled', 'Cannot delete an asset that is in use')
                            : translate('itemActions.delete', 'Delete asset')
                    }
                    disabled={asset.isInUse}
                    icon="trash"
                    size="regular"
                    style="neutral"
                    hoverStyle="error"
                    onClick={() => onDeleteAsset(asset)}
                />
            )}
            {asset.file?.url && (
                <a href={asset.file.url} download title={translate('itemActions.download', 'Download asset')}>
                    <IconButton icon="download" size="regular" style="neutral" hoverStyle="success" />
                </a>
            )}
            {asset.localId && (
                <IconButton
                    title={translate('itemActions.copyToClipboard', 'Copy to clipboard')}
                    icon={isInClipboard ? 'clipboard-check' : 'clipboard'}
                    size="regular"
                    style="neutral"
                    hoverStyle="brand"
                    className={isInClipboard ? 'button--active' : ''}
                    onClick={toggleClipboardState}
                />
            )}
        </>
    );
};

export default React.memo(AssetActions);
