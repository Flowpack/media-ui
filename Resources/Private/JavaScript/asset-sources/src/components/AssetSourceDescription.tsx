import React from 'react';

import { ToggablePanel } from '@neos-project/react-ui-components';

import { useIntl } from '@media-ui/core/src';
import { IconLabel } from '@media-ui/core/src/components';
import { useSelectedAssetSource } from '../hooks/useSelectedAssetSource';

import classes from './AssetSourceDescription.module.css';

const AssetSourceDescription: React.FC = () => {
    const { translate } = useIntl();
    const selectedAssetSource = useSelectedAssetSource();

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
};

export default React.memo(AssetSourceDescription);
