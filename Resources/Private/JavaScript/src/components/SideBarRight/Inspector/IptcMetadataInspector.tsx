import * as React from 'react';
import { Headline } from '@neos-project/react-ui-components';
import { createUseMediaUiStyles, useIntl, useMediaUi } from '../../../core';
import { MediaUiTheme } from '../../../interfaces';
import { PropertyList, PropertyListItem } from './PropertyList';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    iptcData: {
        '.neos & dl': {
            '& dt': {
                backgroundColor: theme.alternatingBackgroundColor,
                fontWeight: 'bold',
                color: 'white',
                padding: '8px 8px 0'
            },
            '& dd': {
                backgroundColor: theme.alternatingBackgroundColor,
                marginBottom: '1px',
                padding: '8px',
                lineHeight: '1.3',
                color: theme.inactiveColor
            }
        }
    },
    headline: {
        '.neos &': {
            fontWeight: 'bold',
            lineHeight: theme.spacing.goldenUnit
        }
    }
}));

export default function IptcMetadataInspector() {
    const classes = useStyles();
    const { selectedAsset } = useMediaUi();
    const { translate } = useIntl();

    return (
        <>
            {selectedAsset?.iptcMetadata.length ? (
                <div className={classes.iptcData}>
                    <Headline type="h2" className={classes.headline}>
                        {translate('inspector.iptcMetadata', 'IPTC Metadata')}
                    </Headline>
                    <PropertyList>
                        {selectedAsset.iptcMetadata.map(iptcMetadata => (
                            <PropertyListItem
                                key={iptcMetadata.key}
                                label={iptcMetadata.key}
                                value={iptcMetadata.value}
                            />
                        ))}
                    </PropertyList>
                </div>
            ) : null}
        </>
    );
}
