import React from 'react';

import { IconButton } from '@neos-project/react-ui-components';
import { useIntl } from '@media-ui/core';

const DownloadAssetButton: React.FC<{ asset: Asset; style?: string; size?: 'small' | 'regular' }> = ({
    asset,
    style = 'transparent',
    size = 'regular',
}) => {
    const { translate } = useIntl();

    return asset.file?.url ? (
        <a href={asset.file.url} download title={translate('itemActions.download', 'Download asset')}>
            <IconButton icon="download" size={size} style={style} hoverStyle="success" />
        </a>
    ) : null;
};

export default DownloadAssetButton;
