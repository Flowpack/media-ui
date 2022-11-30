import * as React from 'react';

import { IconButton } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core/src';
import { Asset } from '@media-ui/core/src/interfaces';
import { useClipboard } from '@media-ui/feature-clipboard/src';

interface PreviewActionsProps {
    asset: Asset;
    buildLinkToMediaUi: (asset: Asset) => string;
}

const PreviewActions: React.FC<PreviewActionsProps> = ({ asset, buildLinkToMediaUi }: PreviewActionsProps) => {
    const { translate } = useIntl();
    const { toggleClipboardState } = useClipboard();

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
            {asset.file?.url && (
                <a href={asset.file.url} download title={translate('previewActions.download', 'Download asset')}>
                    <IconButton icon="download" size="regular" style="transparent" hoverStyle="warn" />
                </a>
            )}
            {asset.localId && (
                <IconButton
                    title={translate('itemActions.copyToClipboard', 'Copy to clipboard')}
                    icon={asset.isInClipboard ? 'clipboard-check' : 'clipboard'}
                    size="regular"
                    style="transparent"
                    hoverStyle="brand"
                    className={asset.isInClipboard ? 'button--active' : ''}
                    onClick={() => toggleClipboardState({ assetId: asset.id, assetSourceId: asset.assetSource.id })}
                />
            )}
        </>
    );
};

export default React.memo(PreviewActions);
