import React from 'react';

import { IconButton } from '@neos-project/react-ui-components';
import { useIntl } from '@media-ui/core';

const DownloadAssetButton: React.FC<{ asset: Asset; style?: string }> = ({ asset, style = 'transparent' }) => {
    const { translate } = useIntl();

    return asset.file?.url ? (
        <a href={asset.file.url} download title={translate('itemActions.download', 'Download asset')}>
            <IconButton icon="download" size="regular" style={style} hoverStyle="success" />
        </a>
    ) : null;
};

export default DownloadAssetButton;
