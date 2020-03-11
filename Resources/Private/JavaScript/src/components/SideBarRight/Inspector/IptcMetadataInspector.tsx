import * as React from 'react';
import { createUseMediaUiStyles, useIntl, useMediaUi } from '../../../core';
import { MediaUiTheme } from '../../../interfaces';

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
                    <label>{translate('inspector.iptcMetadata', 'IPTC Metadata')}</label>
                    <dl>
                        {selectedAsset.iptcMetadata.map(iptcMetadata => (
                            <React.Fragment key={iptcMetadata.key}>
                                <dt>{iptcMetadata.key}</dt>
                                <dd>{iptcMetadata.value}</dd>
                            </React.Fragment>
                        ))}
                    </dl>
                </div>
            ) : null}
        </>
    );
}
