import { ApolloCache, NormalizedCacheObject } from '@apollo/client';

const buildResolvers = (updateLocalState) => {
    return {
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
        },
    };
};

export default buildResolvers;
