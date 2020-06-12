import * as React from 'react';
import { useRecoilValue } from 'recoil';

import { IconButton } from '@neos-project/react-ui-components';

import { Asset } from '../../interfaces';
import { selectedAssetSourceState } from '../../state';
import { useIntl, useMediaUi, useNotify } from '../../core';
import { useImportAsset } from '../../hooks';

interface ItemActionsProps {
    asset: Asset;
}

export default function AssetActions({ asset }: ItemActionsProps) {
    const { translate } = useIntl();
    const Notify = useNotify();
    const selectedAssetSource = useRecoilValue(selectedAssetSourceState);
    const { setSelectedAssetForPreview, handleDeleteAsset } = useMediaUi();
    const { importAsset } = useImportAsset();

    const handleImportAsset = () => {
        importAsset({ asset })
            .then(() => {
                Notify.ok(translate('assetActions.import.success', 'Asset was successfully imported'));
            })
            .catch(error => {
                Notify.error(translate('assetActions.import.error', 'Failed to import asset'), error.message);
            });
    };

    return (
        <>
            <IconButton
                title={translate('itemActions.preview', 'Preview asset')}
                icon="expand-alt"
                size="regular"
                style="transparent"
                hoverStyle="brand"
                onClick={() => setSelectedAssetForPreview(asset)}
            />
            {!asset.imported && !asset.localId && (
                <IconButton
                    title={translate('itemActions.import', 'Import asset')}
                    icon="cloud-download-alt"
                    size="regular"
                    style="transparent"
                    hoverStyle="brand"
                    onClick={() => handleImportAsset()}
                />
            )}
            {!selectedAssetSource?.readOnly && (
                <IconButton
                    title={translate('itemActions.delete', 'Delete asset')}
                    icon="trash"
                    size="regular"
                    style="transparent"
                    hoverStyle="warn"
                    onClick={() => handleDeleteAsset(asset)}
                />
            )}
        </>
    );
}
