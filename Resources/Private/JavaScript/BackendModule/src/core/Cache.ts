import { InMemoryCache } from '@apollo/client';
import { ApolloCache } from '@apollo/client/cache/core/cache';
import { NormalizedCacheObject } from '@apollo/client/cache/inmemory/types';

import { IdFromObjectResolver, PersistentStateManager } from './index';
import { AssetIdentity } from '../interfaces';

class CacheFactory {
    public static createCache(): ApolloCache<NormalizedCacheObject> {
        return new InMemoryCache({
            dataIdFromObject: IdFromObjectResolver,
            typePolicies: {
                Query: {
                    fields: {
                        // These resolvers allow fetching single entities from the cache that were already retrieved from any previous query
                        asset(_, { args, toReference }) {
                            return toReference({ __typename: 'Asset', id: args.id });
                        },
                        tag(_, { args, toReference }) {
                            return toReference({ __typename: 'Tag', id: args.id });
                        },
                        assetCollection(_, { args, toReference }) {
                            return toReference({ __typename: 'AssetCollection', id: args.id });
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
            },
        });
    }
}

export default CacheFactory;
