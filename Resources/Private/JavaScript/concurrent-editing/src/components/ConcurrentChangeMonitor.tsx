import React, { useEffect } from 'react';

import { useAssetQuery, useAssetsQuery } from '@media-ui/core/src/hooks';
import { assetCreatedEvent, assetRemovedEvent, assetUpdatedEvent } from '@media-ui/core/src/events';
import { NEOS_ASSET_SOURCE } from '@media-ui/feature-asset-sources';

import useChangedAssetsQuery from '../hooks/useChangedAssetsQuery';

/**
 * Renderless component to watch for remote changes, update cached assets and inform the user if necessary
 */
const ConcurrentChangeMonitor: React.FC = () => {
    const changedAssets = useChangedAssetsQuery();
    const { refetch: refetchAsset } = useAssetQuery();
    const { refetch: refetchAssets } = useAssetsQuery();

    useEffect(() => {
        // Prevent errors when the queries are not yet initialized
        if (!refetchAssets || !refetchAsset) {
            return;
        }
        changedAssets?.forEach((change) => {
            switch (change.type) {
                case 'ASSET_REPLACED':
                case 'ASSET_UPDATED':
                    refetchAsset({ id: change.assetId, assetSourceId: NEOS_ASSET_SOURCE }).then(() => {
                        // TODO: Show some notification in the ui
                        console.info(change.assetId, change.type, 'An asset was updated due to a remote change');
                    });
                    assetUpdatedEvent({ assetId: change.assetId, assetSourceId: NEOS_ASSET_SOURCE });
                    break;
                case 'ASSET_CREATED':
                    refetchAssets().then(() => {
                        // TODO: Show some notification in the ui
                        console.info(change.assetId, change.type, 'An asset was created remotely');
                    });
                    assetCreatedEvent({ assetId: change.assetId, assetSourceId: NEOS_ASSET_SOURCE });
                    break;
                case 'ASSET_REMOVED':
                    refetchAssets().then(() => {
                        // TODO: Show some notification in the ui
                        console.info(change.assetId, change.type, 'An asset was removed remotely');
                    });
                    assetRemovedEvent({ assetId: change.assetId, assetSourceId: NEOS_ASSET_SOURCE });
                    break;
                default:
                    console.debug(change, 'unhandled remote change');
            }
        });
    }, [changedAssets, refetchAsset, refetchAssets]);

    return null;
};

export default React.memo(ConcurrentChangeMonitor);
