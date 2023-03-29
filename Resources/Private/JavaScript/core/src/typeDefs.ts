import { gql } from '@apollo/client';

export const typeDefs = gql`
    # Define the apollo specific directives here to prevent schema warnings in the IDE
    directive @client(always: Boolean!) on FIELD
    directive @export(as: String!) on FIELD

    type AssetIdentity {
        id: AssetId!
        assetSourceId: AssetSourceId!
    }

    extend type Query {
        viewModeSelection: String
    }

    extend type Mutation {
        setViewModeSelection(viewModeSelection: String): String
    }
`;
