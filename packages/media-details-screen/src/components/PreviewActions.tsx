import React from 'react';
import { useRecoilState } from 'recoil';

import { IconButton } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { clipboardItemState } from '@media-ui/feature-clipboard';
import DownloadAssetButton from '@media-ui/media-module/src/components/Actions/DownloadAssetButton';

interface PreviewActionsProps {
    asset: Asset;
    buildLinkToMediaUi: (asset: Asset) => string;
}

const PreviewActions: React.FC<PreviewActionsProps> = ({ asset, buildLinkToMediaUi }: PreviewActionsProps) => {
    const { translate } = useIntl();
    const [isInClipboard, toggleClipboardState] = useRecoilState(
        clipboardItemState({ assetId: asset.id, assetSourceId: asset.assetSource.id })
    );

    return (
        <>
            <a
                href={buildLinkToMediaUi(asset)}
                title={translate('previewActions.openInMediaModule', 'Open asset in media module')}
                target="_blank"
                rel="noreferrer noopener"
            >
                <IconButton icon="image" size="regular" style="transparent" hoverStyle="brand" />
            </a>
            {asset.file?.url && (
                <a
                    href={asset.file.url}
                    title={translate('previewActions.openInNewTab', 'Open asset in a new browser tab')}
                    target="_blank"
                    rel="noreferrer noopener"
                >
                    <IconButton icon="external-link-alt" size="regular" style="transparent" hoverStyle="brand" />
                </a>
            )}
            <DownloadAssetButton asset={asset} />
            {asset.localId && (
                <IconButton
                    title={translate('itemActions.copyToClipboard', 'Copy to clipboard')}
                    icon={isInClipboard ? 'clipboard-check' : 'clipboard'}
                    size="regular"
                    style="transparent"
                    hoverStyle="brand"
                    className={isInClipboard ? 'button--active' : ''}
                    onClick={toggleClipboardState}
                />
            )}
        </>
    );
};

export default React.memo(PreviewActions);
