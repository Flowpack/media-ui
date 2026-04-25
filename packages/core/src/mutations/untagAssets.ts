import { gql } from '@apollo/client';

const UNTAG_ASSETS = gql`
    mutation UntagAssets($identities: [AssetIdentityInput!]!, $tagId: TagId!) {
        untagAssets(identities: $identities, tagId: $tagId) {
            success
            messages
        }
    }
`;

export default UNTAG_ASSETS;
