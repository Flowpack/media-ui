import React from 'react';

import { Headline } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core';
import { useSelectedAsset } from '@media-ui/core/src/hooks';
import { IconLabel, PropertyList, PropertyListItem } from '@media-ui/core/src/components';

import classes from './IptcMetadataInspector.module.css';

const IptcMetadataInspector: React.FC = () => {
    const selectedAsset = useSelectedAsset();
    const { translate } = useIntl();

    if (!selectedAsset?.iptcProperties?.length) return null;

    return (
        <div className={classes.iptcData}>
            <Headline type="h2">
                <IconLabel icon="camera" label={translate('inspector.iptcMetadata', 'IPTC Metadata')} />
            </Headline>
            <PropertyList>
                {selectedAsset.iptcProperties.map((iptcProperty) => (
                    <PropertyListItem
                        key={iptcProperty.propertyName}
                        label={iptcProperty.propertyName}
                        value={iptcProperty.value}
                    />
                ))}
            </PropertyList>
        </div>
    );
};

export default React.memo(IptcMetadataInspector);
