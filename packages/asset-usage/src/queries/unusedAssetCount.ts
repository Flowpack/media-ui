import { gql } from '@apollo/client';

const UNUSED_ASSET_COUNT = gql`
    query UNUSED_ASSET_COUNT {
        unusedAssetCount
    }
`;

export default UNUSED_ASSET_COUNT;
