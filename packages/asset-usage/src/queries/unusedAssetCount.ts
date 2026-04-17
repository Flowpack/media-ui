import { gql } from '@apollo/client';

const UNUSED_ASSET_COUNT = gql`
    query UNUSED_ASSET_COUNT($assetSourceId: AssetSourceId!) {
        unusedAssetCount(assetSourceId: $assetSourceId)
    }
`;

export default UNUSED_ASSET_COUNT;
