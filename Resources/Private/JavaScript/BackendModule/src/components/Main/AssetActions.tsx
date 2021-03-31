import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useSetRecoilState } from 'recoil';

import { IconButton } from '@neos-project/react-ui-components';

import { Asset } from '../../interfaces';
import { selectedAssetForPreviewState } from '../../state';
import { useIntl, useMediaUi, useNotify } from '../../core';
import { useImportAsset, useClipboard } from '../../hooks';

interface ItemActionsProps {
    asset: Asset;
}

const AssetActions: React.FC<ItemActionsProps> = ({ asset }: ItemActionsProps) => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const { handleDeleteAsset } = useMediaUi();
    const setSelectedAssetForPreview = useSetRecoilState(selectedAssetForPreviewState);
    const { importAsset } = useImportAsset();
    const { clipboard, addOrRemoveFromClipboard } = useClipboard();

    const isInClipboard = useMemo(() => {
        return !!clipboard.find(({ assetId }) => assetId === asset.id);
    }, [asset.id, clipboard]);

    const onImportAsset = useCallback(() => {
        importAsset(asset)
            .then(() => {
                Notify.ok(translate('assetActions.import.success', 'Asset was successfully imported'));
            })
            .catch((error) => {
                Notify.error(translate('assetActions.import.error', 'Failed to import asset'), error.message);
            });
    }, [importAsset, asset, Notify, translate]);

    const onPreviewAsset = useCallback(() => {
        setSelectedAssetForPreview(asset);
    }, [setSelectedAssetForPreview, asset]);

    const onDeleteAsset = useCallback(() => {
        handleDeleteAsset(asset);
    }, [handleDeleteAsset, asset]);

    const onCopyAssetToClipboard = useCallback(() => {
        addOrRemoveFromClipboard({ assetId: asset.id, assetSourceId: asset.assetSource.id });
    }, [addOrRemoveFromClipboard, asset]);

    return (
        <>
            <IconButton
                title={translate('itemActions.preview', 'Preview asset')}
                icon="expand-alt"
                size="regular"
                style="transparent"
                hoverStyle="brand"
                onClick={onPreviewAsset}
            />
            {!asset.imported && !asset.localId && (
                <IconButton
                    title={translate('itemActions.import', 'Import asset')}
                    icon="cloud-download-alt"
                    size="regular"
                    style="transparent"
                    hoverStyle="brand"
                    onClick={onImportAsset}
                />
            )}
            {!asset.assetSource.readOnly && (
                <IconButton
                    title={translate('itemActions.delete', 'Delete asset')}
                    icon="trash"
                    size="regular"
                    style="transparent"
                    hoverStyle="warn"
                    onClick={onDeleteAsset}
                />
            )}
            {asset.file?.url && (
                <a href={asset.file.url} download title={translate('itemActions.download', 'Download asset')}>
                    <IconButton icon="download" size="regular" style="transparent" hoverStyle="warn" />
                </a>
            )}
            {asset.localId && (
                <IconButton
                    title={translate('itemActions.copyToClipboard', 'Copy to clipboard')}
                    icon={isInClipboard ? 'clipboard-check' : 'clipboard'}
                    size="regular"
                    style="transparent"
                    hoverStyle="brand"
                    onClick={onCopyAssetToClipboard}
                />
            )}
        </>
    );
};

export default React.memo(AssetActions);
