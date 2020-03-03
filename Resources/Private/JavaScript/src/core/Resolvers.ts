import { gql } from 'apollo-boost';
import { updateLocalState } from './PersistentStateManager';

export const typeDefs = gql`
    extend type Query {
        assetSourceFilter: String
    }

    extend type Mutation {
        setAssetSourceFilter(assetSourceFilter: String): String
    }
`;

export const resolvers = {
    Mutation: {
        setAssetSourceFilter: (_, { assetSourceFilter }, { cache }) => {
            updateLocalState({ assetSourceFilter }, cache);
            return assetSourceFilter;
        }
    }
};
