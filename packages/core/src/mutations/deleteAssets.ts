import { gql } from '@apollo/client';

const DELETE_ASSETS = gql`
    mutation DeleteAssets($identities: [AssetIdentityInput!]!) {
        deleteAssets(identities: $identities) {
            success
            messages
        }
    }
`;

export default DELETE_ASSETS;
