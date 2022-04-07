import * as React from 'react';

import { AssetCollectionTree } from './Tree';
import { AssetSourceList, AssetSourceDescription } from './index';
import { Column } from '../Presentation';
import { useMediaUi } from '@media-ui/core/src';
import { UploadButton } from '@media-ui/feature-asset-upload/src/components';

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
