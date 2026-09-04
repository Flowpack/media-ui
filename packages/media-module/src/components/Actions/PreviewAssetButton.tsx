import React from 'react';
import { useSetRecoilState } from 'recoil';

import { useIntl } from '@media-ui/core';
import { ActionButton } from '@media-ui/core/src/components';
import { selectedAssetForPreviewState } from '@media-ui/feature-asset-preview';

interface PreviewAssetButtonProps {
    asset: Asset;
    hideLabel?: boolean;
    className?: string;
}

const PreviewAssetButton: React.FC<PreviewAssetButtonProps> = ({ asset, hideLabel, className }) => {
    const { translate } = useIntl();
    const setSelectedAssetForPreview = useSetRecoilState(selectedAssetForPreviewState);

    return (
        <ActionButton
            icon="expand-alt"
            label={translate('itemActions.preview', 'Preview asset')}
            hideLabel={hideLabel}
            className={className}
            onClick={() =>
                setSelectedAssetForPreview({ assetId: asset.id, assetSourceId: asset.assetSource.id })
            }
        />
    );
};

export default React.memo(PreviewAssetButton);
