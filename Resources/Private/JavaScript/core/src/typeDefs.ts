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
        selectedAssetSourceId: String
        viewModeSelection: String
    }

    extend type Mutation {
        setSelectedAssetSourceId(selectedAssetSourceId: String): String
        setViewModeSelection(viewModeSelection: String): String
    }
`;
