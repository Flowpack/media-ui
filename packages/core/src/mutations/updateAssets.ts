import { gql } from '@apollo/client';

const UPDATE_ASSETS = gql`
    mutation UpdateAssets($identities: [AssetIdentityInput!]!, $copyrightNotice: String) {
        updateAssets(identities: $identities, copyrightNotice: $copyrightNotice) {
            success
            messages
        }
    }
`;

export default UPDATE_ASSETS;
