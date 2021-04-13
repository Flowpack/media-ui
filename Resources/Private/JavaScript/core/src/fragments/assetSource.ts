import { gql } from '@apollo/client';

export const ASSET_SOURCE_FRAGMENT = gql`
    fragment AssetSourceProps on AssetSource {
        label
        id
        description
        iconUri
        readOnly
        supportsTagging
        supportsCollections
    }
`;
