import { ApolloCache } from '@apollo/client';

import { updateLocalState } from './PersistentStateManager';
import { NormalizedCacheObject } from '@apollo/client/cache';
import { AssetIdentity } from '@media-ui/core/src/interfaces';
import { CLIPBOARD } from '@media-ui/feature-clipboard/src';

// noinspection JSUnusedGlobalSymbols
export const resolvers = {
    Mutation: {
        setSelectedAssetSourceId: (
            _,
            { selectedAssetSourceId },
            { cache }: { cache: ApolloCache<NormalizedCacheObject> }
        ) => {
            updateLocalState({ selectedAssetSourceId }, cache);
            return selectedAssetSourceId;
        },
        setViewModeSelection: (
            _,
            { viewModeSelection }: { viewModeSelection: string },
            { cache }: { cache: ApolloCache<NormalizedCacheObject> }
        ) => {
            updateLocalState({ viewModeSelection }, cache);
            return viewModeSelection;
        },
        addOrRemoveFromClipboard: (
            _,
            assetIdentity: AssetIdentity,
            { cache }: { cache: ApolloCache<NormalizedCacheObject> }
        ) => {
            let { clipboard }: { clipboard: AssetIdentity[] } = cache.readQuery({ query: CLIPBOARD });
            if (clipboard.some(({ assetId }) => assetId === assetIdentity.assetId)) {
                clipboard = clipboard.filter(({ assetId }) => assetId !== assetIdentity.assetId);
            } else {
                clipboard = clipboard.concat([assetIdentity]);
            }
            updateLocalState({ clipboard }, cache);
            return clipboard;
        },
    },
};
