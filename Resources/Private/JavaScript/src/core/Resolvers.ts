import { gql } from 'apollo-boost';

import { updateLocalState } from './PersistentStateManager';

export const typeDefs = gql`
    extend type Query {
        selectedAssetSourceId: String
        viewModeSelection: String
    }

    extend type Mutation {
        setSelectedAssetSourceId(selectedAssetSourceId: String): String
        setViewModeSelection(viewModeSelection: String): String
    }
`;

// noinspection JSUnusedGlobalSymbols
export const resolvers = {
    Mutation: {
        setSelectedAssetSourceId: (_, { selectedAssetSourceId }, { cache }) => {
            updateLocalState({ selectedAssetSourceId }, cache);
            return selectedAssetSourceId;
        },
        setViewModeSelection: (_, { viewModeSelection }, { cache }) => {
            updateLocalState({ viewModeSelection }, cache);
            return viewModeSelection;
        }
    }
};
