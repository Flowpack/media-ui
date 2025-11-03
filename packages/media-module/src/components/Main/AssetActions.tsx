import React, { useCallback } from 'react';
import { useSetRecoilState, useRecoilState } from 'recoil';

import { IconButton } from '@neos-project/react-ui-components';

import { useIntl, useNotify } from '@media-ui/core';
import { useImportAsset } from '@media-ui/core/src/hooks';
import { selectedAssetForPreviewState } from '@media-ui/feature-asset-preview';
import { clipboardItemState } from '@media-ui/feature-clipboard';
import DownloadAssetButton from '../Actions/DownloadAssetButton';
import DeleteAssetButton from '../Actions/DeleteAssetButton';

interface ItemActionsProps {
    asset: Asset;
}

const AssetActions: React.FC<ItemActionsProps> = ({ asset }: ItemActionsProps) => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const setSelectedAssetForPreview = useSetRecoilState(selectedAssetForPreviewState);
    const { importAsset } = useImportAsset();
    const [isInClipboard, toggleClipboardState] = useRecoilState(
        clipboardItemState({ assetId: asset.id, assetSourceId: asset.assetSource.id })
    );

    // TODO: Optimize rendering this component when hooks change, as it takes quite a bit of time
    const onImportAsset = useCallback(() => {
        importAsset({ assetId: asset.id, assetSourceId: asset.assetSource.id })
            .then(() => {
                Notify.ok(translate('assetActions.import.success', 'Asset was successfully imported'));
            })
            .catch(() => {
                return;
            });
    }, [importAsset, asset, Notify, translate]);

    const canBeViewedInLightbox = asset.thumbnailUrl.indexOf('/Static/Packages/') === -1;

    if (!asset) return null;

    return (
        <>
            {canBeViewedInLightbox && (
                <IconButton
                    title={translate('itemActions.preview', 'Preview asset')}
                    icon="expand-alt"
                    size="small"
                    style="transparent"
                    hoverStyle="brand"
                    onClick={() =>
                        setSelectedAssetForPreview({ assetId: asset.id, assetSourceId: asset.assetSource.id })
                    }
                />
            )}
            {asset.file?.url && (
                <a
                    href={asset.file.url}
                    title={translate('itemActions.openInNewTab', 'Open asset in a new browser tab')}
                    target="_blank"
                    rel="noreferrer noopener"
                >
                    <IconButton icon="external-link-alt" size="small" style="transparent" hoverStyle="brand" />
                </a>
            )}
            {!asset.imported && !asset.localId && (
                <IconButton
                    title={translate('itemActions.import', 'Import asset')}
                    icon="cloud-download-alt"
                    size="small"
                    style="transparent"
                    hoverStyle="brand"
                    onClick={onImportAsset}
                />
            )}
            <DeleteAssetButton asset={asset} size="small" />
            <DownloadAssetButton asset={asset} size="small" />
            {asset.localId && (
                <IconButton
                    title={
                        isInClipboard
                            ? translate('itemActions.removeFromClipboard', 'Remove from clipboard')
                            : translate('itemActions.copyToClipboard', 'Copy to clipboard')
                    }
                    icon={isInClipboard ? 'clipboard-check' : 'clipboard'}
                    size="small"
                    style="transparent"
                    hoverStyle="brand"
                    className={isInClipboard ? 'button--active' : ''}
                    onClick={toggleClipboardState}
                />
            )}
        </>
    );
};

export default React.memo(AssetActions);
