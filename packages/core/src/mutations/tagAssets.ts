import { gql } from '@apollo/client';

const TAG_ASSETS = gql`
    mutation TagAssets($identities: [AssetIdentityInput!]!, $tagId: TagId!) {
        tagAssets(identities: $identities, tagId: $tagId) {
            success
            messages
        }
    }
`;

export default TAG_ASSETS;
