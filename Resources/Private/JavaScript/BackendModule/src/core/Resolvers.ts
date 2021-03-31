import gql from 'graphql-tag';

import { updateLocalState } from './PersistentStateManager';
import { CLIPBOARD } from '../queries';
import { ApolloCache } from '@apollo/client';
import { NormalizedCacheObject } from '@apollo/client/cache';
import { AssetIdentity } from '../interfaces';

// TODO: Split this into feature specific separate typedefs and resolvers and give them as array to the apollo client

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
            // let added = true;
            if (clipboard.find(({ assetId }) => assetId === assetIdentity.assetId)) {
                clipboard = clipboard.filter(({ assetId }) => assetId !== assetIdentity.assetId);
                // added = false;
            } else {
                clipboard = clipboard.concat([assetIdentity]);
            }
            // cache.writeFragment({
            //     id: `Asset_${assetIdentity.assetId}`,
            //     fragment: gql`
            //         fragment UpdatedAsset on Asset {
            //             isInClipboard
            //         }
            //     `,
            //     data: {
            //         isInClipboard: added,
            //     },
            // });
            updateLocalState({ clipboard }, cache);
            return clipboard;
        },
    },
};
