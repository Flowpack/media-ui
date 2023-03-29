import React from 'react';

import { ToggablePanel } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core/src';
import { useSelectAssetSource } from '@media-ui/core/src/hooks';
import { IconLabel } from '@media-ui/core/src/components';

import classes from './AssetSourceDescription.module.css';

export default function AssetSourceDescription() {
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
