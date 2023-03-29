import React from 'react';

import { useMediaUi } from '@media-ui/core/src';
import { Column } from '@media-ui/core/src/components';
import { UploadButton } from '@media-ui/feature-asset-upload/src/components';
import { AssetCollectionTree } from '@media-ui/feature-asset-collections';
import { AssetSourceDescription, AssetSourceList } from '@media-ui/feature-asset-sources';

const SideBarLeft: React.FC = () => {
    const { selectionMode } = useMediaUi();
    const components = [
        !selectionMode && UploadButton,
        AssetSourceList,
        AssetCollectionTree,
        AssetSourceDescription,
    ].filter(Boolean);

    return (
        <Column>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </Column>
    );
};

export default React.memo(SideBarLeft);
