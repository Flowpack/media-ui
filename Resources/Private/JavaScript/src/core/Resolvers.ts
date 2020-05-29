import { gql } from 'apollo-boost';

import { updateLocalState } from './PersistentStateManager';

export const typeDefs = gql`
    extend type Query {
        assetSourceFilter: String
        viewModeSelection: String
    }

    extend type Mutation {
        setAssetSourceFilter(assetSourceFilter: String): String
        setViewModeSelection(viewModeSelection: String): String
    }
`;

// noinspection JSUnusedGlobalSymbols
export const resolvers = {
    Mutation: {
        setAssetSourceFilter: (_, { assetSourceFilter }, { cache }) => {
            updateLocalState({ assetSourceFilter }, cache);
            return assetSourceFilter;
        },
        setViewModeSelection: (_, { viewModeSelection }, { cache }) => {
            updateLocalState({ viewModeSelection }, cache);
            return viewModeSelection;
        }
    }
};
