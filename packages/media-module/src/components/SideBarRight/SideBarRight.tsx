import React from 'react';

import { Column } from '@media-ui/core/src/components';

import { AssetInspector, AssetCollectionInspector, TagInspector } from './Inspector';
import CurrentSelection from './CurrentSelection';
import CurrentMultiSelection from './CurrentMultiSelection';

const SideBarRight = () => {
    // TODO: Read from component store
    const components = [
        CurrentMultiSelection,
        CurrentSelection,
        AssetInspector,
        AssetCollectionInspector,
        TagInspector,
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
