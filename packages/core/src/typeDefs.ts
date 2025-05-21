import { gql } from '@apollo/client';

export const typeDefs = gql`
    # Define the apollo specific directives here to prevent schema warnings in the IDE
    directive @client(always: Boolean!) on FIELD
    directive @export(as: String!) on FIELD

    # TODO: Can this type be removed or moved to the root schema?
    type AssetIdentity {
        id: AssetId!
        assetSourceId: AssetSourceId!
    }
`;
