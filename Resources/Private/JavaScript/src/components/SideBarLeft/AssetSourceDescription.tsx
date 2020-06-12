import * as React from 'react';
import { Icon, ToggablePanel } from '@neos-project/react-ui-components';
import { createUseMediaUiStyles, useIntl, useMediaUi } from '../../core';
import { useAssetSourceFilter } from '../../hooks';
import { MediaUiTheme } from '../../interfaces';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    assetSourceDescription: {
        border: `1px solid ${theme.colors.border}`,
        '& .ReactCollapse--collapse': {
            transition: `height ${theme.transition.slow}`
        }
    },
    panelHeader: {
        '& button': {
            position: 'absolute'
        }
    }
}));

export default function AssetSourceDescription() {
    const classes = useStyles();
    const { assetSources } = useMediaUi();
    const [assetSourceFilter] = useAssetSourceFilter();
    const { translate } = useIntl();

    const selectedAssetSource = assetSources.find(assetSource => assetSource.id === assetSourceFilter);

    return (
        <>
            {selectedAssetSource?.description && (
                <ToggablePanel closesToBottom={true} className={classes.assetSourceDescription}>
                    <ToggablePanel.Header className={classes.panelHeader}>
                        <Icon icon="info-circle" padded="right" />
                        {translate('assetSourceDescription.header', 'Media source description')}
                    </ToggablePanel.Header>
                    <ToggablePanel.Contents>
                        <p>{selectedAssetSource.description}</p>
                    </ToggablePanel.Contents>
                </ToggablePanel>
            )}
        </>
    );
}
