import * as React from 'react';

import { AssetInspector, IptcMetadataInspector } from './Inspector';
import CurrentSelection from './CurrentSelection';
import { Column } from '../Presentation';

const SideBarRight: React.FC = () => {
    // TODO: Read from component store
    const components = [CurrentSelection, AssetInspector, IptcMetadataInspector];

    return (
        <Column>
            {components.map((Component, index) => (
                <Component key={index} />
            ))}
        </Column>
    );
};

export default React.memo(SideBarRight);
