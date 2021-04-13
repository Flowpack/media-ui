import { ApolloCache, gql } from '@apollo/client';

import { updateLocalState } from './PersistentStateManager';
import { NormalizedCacheObject } from '@apollo/client/cache';
import { AssetIdentity } from '@media-ui/core/src/interfaces';
import { CLIPBOARD } from '@media-ui/feature-clipboard/src';

// TODO: Split this into feature specific separate typedefs and resolvers and give them as array to the apollo client

// FIXME: Move clipboard specifics to clipboard package

export const typeDefs = gql`
    type AssetIdentity {
        id: AssetId!
        assetSourceId: AssetSourceId!
    }

    extend type Query {
        selectedAssetSourceId: String
        viewModeSelection: String
        clipboard: [AssetIdentity]!
    }

    extend type Asset {
        isInClipboard: Boolean!
    }

    extend type Mutation {
        setSelectedAssetSourceId(selectedAssetSourceId: String): String
        setViewModeSelection(viewModeSelection: String): String
        addOrRemoveFromClipboard(assetId: AssetId!, assetSourceId: AssetSourceId!): [AssetIdentity]!
    }
`;

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
            let added = true;
            if (clipboard.some(({ assetId }) => assetId === assetIdentity.assetId)) {
                clipboard = clipboard.filter(({ assetId }) => assetId !== assetIdentity.assetId);
                added = false;
            } else {
                clipboard = clipboard.concat([assetIdentity]);
            }
            cache.writeFragment({
                id: cache.identify({ __typename: 'Asset', id: assetIdentity.assetId }),
                fragment: gql`
                    fragment UpdatedAsset on Asset {
                        isInClipboard
                    }
                `,
                data: {
                    isInClipboard: added,
                },
            });
            updateLocalState({ clipboard }, cache);
            return clipboard;
        },
    },
};
