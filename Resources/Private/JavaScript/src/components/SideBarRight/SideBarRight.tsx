import * as React from 'react';

import { AssetInspector, IptcMetadataInspector } from './Inspector';
import CurrentSelection from './CurrentSelection';
import { Column } from '../Presentation';

export default function SideBarRight() {
    // TODO: Read from component store
    const components = [CurrentSelection, AssetInspector, IptcMetadataInspector];

    return (
        <Column>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </Column>
    );
}
