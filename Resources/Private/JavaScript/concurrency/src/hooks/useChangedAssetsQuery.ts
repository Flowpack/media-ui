import { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';

import { useConfigQuery } from '@media-ui/core/src/hooks';

import CHANGED_ASSETS from '../queries/changedAssets';

export enum AssetChangeType {
    ASSET_CREATED = 'ASSET_CREATED',
    ASSET_UPDATED = 'ASSET_UPDATED',
    ASSET_REPLACED = 'ASSET_REPLACED',
    ASSET_REMOVED = 'ASSET_REMOVED',
}

export interface AssetChange {
    assetId: string;
    lastModified: Date;
    type: AssetChangeType;
}

export interface AssetChangeQueryResult {
    changedAssets: {
        lastModified: Date;
        changes: AssetChange[];
    };
}

// Check for updates every 5 seconds
const pollInterval = 5000;

const AssetLastModifiedFragment = gql`
    fragment AssetLastModified on Asset {
        lastModified
    }
`;

export default function useChangedAssetsQuery() {
    const { config } = useConfigQuery();
    const [lastUpdate, setLastUpdate] = useState<Date>(null);
    const [changes, setChanges] = useState<AssetChange[]>([]);

    // Query will continue to run on its own and poll the api
    const { data, client } = useQuery<AssetChangeQueryResult>(CHANGED_ASSETS, {
        variables: { since: lastUpdate ?? config?.currentServerTime },
        pollInterval,
        skip: !config?.currentServerTime,
    });

    // "onComplete" in the query options cannot be used, as it's only called once, due to the bug described in https://github.com/apollographql/apollo-client/issues/5531
    useEffect(() => {
        if (!data?.changedAssets) return;
        const { lastModified, changes } = data.changedAssets;
        // FIXME: Updating lastModified will immediately trigger another query for changes. Maybe we can't prevent this and rather wait for the next interval.
        if (lastModified) setLastUpdate(lastModified);

        const relevantChanges = changes.filter((change) => {
            // New assets are always relevant and we surely have no previous version in the cache
            if (change.type === AssetChangeType.ASSET_CREATED) {
                return true;
            }

            // Check if we have a cached version of the changed asset
            const data: { lastModified: Date } = client.cache.readFragment({
                fragment: AssetLastModifiedFragment,
                id: client.cache.identify({ __typename: 'Asset', id: change.assetId }),
            });

            // Ignore changes to assets we never queried
            if (!data) {
                return false;
            }

            // Ignore changes that are older than our own version
            return data.lastModified < change.lastModified;
        });

        // Prevent triggering an update of the hook if we have zero changes since last time
        setChanges((prev) => (relevantChanges.length === 0 ? prev : relevantChanges));
    }, [data?.changedAssets, client]);

    return changes;
}
