import * as React from 'react';

import { Headline } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl } from '../../../core';
import { MediaUiTheme } from '../../../interfaces';
import { IconLabel, PropertyList, PropertyListItem } from '../../Presentation';
import { useSelectedAsset } from '../../../hooks';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    iptcData: {
        '& dl': {
            '& dt': {
                backgroundColor: theme.colors.alternatingBackground,
                fontWeight: 'bold',
                color: 'white',
                padding: '8px 8px 0'
            },
            '& dd': {
                backgroundColor: theme.colors.alternatingBackground,
                marginBottom: '1px',
                padding: '8px',
                color: theme.colors.inactive
            }
        }
    }
}));

const IptcMetadataInspector: React.FC = () => {
    const classes = useStyles();
    const selectedAsset = useSelectedAsset();
    const { translate } = useIntl();

    if (!selectedAsset?.iptcProperties?.length) return null;

    return (
        <div className={classes.iptcData}>
            <Headline type="h2">
                <IconLabel icon="camera" label={translate('inspector.iptcMetadata', 'IPTC Metadata')} />
            </Headline>
            <PropertyList>
                {selectedAsset.iptcProperties.map(iptcProperty => (
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
