import { InMemoryCache } from '@apollo/client';
import { ApolloCache } from '@apollo/client/cache/core/cache';
import { NormalizedCacheObject } from '@apollo/client/cache/inmemory/types';

import { AssetIdentity, FeatureFlags } from '@media-ui/core/src/interfaces';

import { IdFromObjectResolver, PersistentStateManager } from './index';

class CacheFactory {
    public static createCache(featureFlags: FeatureFlags): ApolloCache<NormalizedCacheObject> {
        return new InMemoryCache({
            dataIdFromObject: IdFromObjectResolver,
            typePolicies: {
                Query: {
                    fields: {
                        // These resolvers allow fetching single entities from the cache that were already retrieved from any previous query
                        asset(_, { args, toReference }) {
                            return args.id ? toReference({ __typename: 'Asset', id: args.id }) : null;
                        },
                        tag(_, { args, toReference }) {
                            return args.id ? toReference({ __typename: 'Tag', id: args.id }) : null;
                        },
                        assetCollection(_, { args, toReference }) {
                            return args.id ? toReference({ __typename: 'AssetCollection', id: args.id }) : null;
                        },
                        includeUsage() {
                            return featureFlags.fastAssetUsageCalculationSupport;
                        },
                    },
                },
                Mutation: {
                    fields: {
                        includeUsage() {
                            return featureFlags.fastAssetUsageCalculationSupport;
                        },
                    },
                },
                Asset: {
                    keyFields: ['id'],
                    fields: {
                        isInClipboard(_, { variables }) {
                            // TODO: Optimize to just to an array.includes
                            const clipboard = PersistentStateManager.getItem<AssetIdentity[]>('clipboard') || [];
                            return clipboard.find(({ assetId }) => assetId === variables.id) !== undefined;
                        },
                    },
                },
                Tag: {
                    keyFields: ['id'],
                },
                AssetCollection: {
                    keyFields: ['id'],
                },
                AssetSource: {
                    keyFields: ['id'],
                },
            },
        });
    }
}

export default CacheFactory;
