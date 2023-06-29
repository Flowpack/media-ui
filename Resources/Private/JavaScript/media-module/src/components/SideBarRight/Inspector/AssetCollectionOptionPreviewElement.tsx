import React from 'react';

import { SelectBox_Option_MultiLineWithThumbnail } from '@neos-project/react-ui-components';

export interface CollectionOption {
    label: string;
    id: string;
    secondaryLabel?: string;
    tertiaryLabel?: string;
}

export const AssetCollectionOptionPreviewElement: React.FC<{ option: CollectionOption }> = ({ option, ...rest }) => {
    return <SelectBox_Option_MultiLineWithThumbnail {...rest} {...option} />;
};
