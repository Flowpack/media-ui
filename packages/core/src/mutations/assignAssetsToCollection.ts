import { gql } from '@apollo/client';

const ASSIGN_ASSETS_TO_COLLECTION = gql`
    mutation AssignAssetsToCollection($identities: [AssetIdentityInput!]!, $assetCollectionId: AssetCollectionId!) {
        assignAssetsToCollection(identities: $identities, assetCollectionId: $assetCollectionId) {
            success
            messages
        }
    }
`;

export default ASSIGN_ASSETS_TO_COLLECTION;
