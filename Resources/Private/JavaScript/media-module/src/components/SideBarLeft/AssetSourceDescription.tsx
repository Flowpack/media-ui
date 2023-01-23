import * as React from 'react';

import { ToggablePanel } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';
import { useSelectAssetSource } from '@media-ui/core/src/hooks';

import { IconLabel } from '../Presentation';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    assetSourceDescription: {
        border: `1px solid ${theme.colors.border}`,
        '& .ReactCollapse--collapse': {
            transition: `height ${theme.transition.slow}`,
        },
    },
    panelHeader: {
        '& button': {
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
    },
}));

export default function AssetSourceDescription() {
    const classes = useStyles();
    const { translate } = useIntl();
    const [selectedAssetSource] = useSelectAssetSource();

    if (!selectedAssetSource?.description) return null;

    return (
        <ToggablePanel closesToBottom={true} className={classes.assetSourceDescription}>
            <ToggablePanel.Header className={classes.panelHeader}>
                <IconLabel
                    icon="info-circle"
                    label={translate('assetSourceDescription.header', 'Media source description')}
                />
            </ToggablePanel.Header>
            <ToggablePanel.Contents>
                <p>{selectedAssetSource.description}</p>
            </ToggablePanel.Contents>
        </ToggablePanel>
    );
}
