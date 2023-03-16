import React from 'react';

import { Column } from '@media-ui/core/src/components';

import { AssetInspector, AssetCollectionInspector, IptcMetadataInspector, TagInspector } from './Inspector';
import CurrentSelection from './CurrentSelection';

const SideBarRight = () => {
    // TODO: Read from component store
    const components = [
        CurrentSelection,
        AssetInspector,
        AssetCollectionInspector,
        TagInspector,
        IptcMetadataInspector,
    ];

    return (
        <Column>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </Column>
    );
};

export default React.memo(SideBarRight);
