import React from 'react';

import {
    AssetClipboardToggleButton,
    DeleteAssetButton,
    DownloadAssetButton,
    ImportAssetButton,
    OpenAssetInNewTabButton,
    PreviewAssetButton
} from '../Actions';

interface ItemActionsProps {
    asset: Asset;
}

const AssetActions: React.FC<ItemActionsProps> = ({ asset }: ItemActionsProps) => {
    const canBeViewedInLightbox = asset.thumbnailUrl?.indexOf('/Static/Packages/') === -1;

    if (!asset) return null;

    return (
        <>
            {canBeViewedInLightbox && <PreviewAssetButton asset={asset} hideLabel />}
            {asset.file?.url && <OpenAssetInNewTabButton asset={asset} hideLabel />}
            {!asset.imported && !asset.localId && <ImportAssetButton asset={asset} hideLabel />}
            <DeleteAssetButton asset={asset} hideLabel />
            <DownloadAssetButton assets={[asset]} hideLabel />
            {asset.localId && <AssetClipboardToggleButton asset={asset} hideLabel />}
        </>
    );
};

export default React.memo(AssetActions);
