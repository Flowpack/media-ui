import * as React from 'react';

import { AssetCollectionTree } from './Tree';
import { AssetSourceList, AssetSourceDescription, UploadButton } from './index';
import { Column } from '../Presentation';

export default function SideBarLeft() {
    const components = [UploadButton, AssetSourceList, AssetCollectionTree, AssetSourceDescription];

    return (
        <Column>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </Column>
    );
}
