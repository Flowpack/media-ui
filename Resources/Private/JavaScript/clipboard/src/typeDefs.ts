import { gql } from '@apollo/client';

export const typeDefs = gql`
    extend type Query {
        clipboard: [AssetIdentity]!
    }

    extend type Asset {
        isInClipboard: Boolean!
    }

    extend type Mutation {
        toggleClipboardState(assetId: AssetId!, assetSourceId: AssetSourceId!, force: Boolean): [AssetIdentity]!
    }
`;
