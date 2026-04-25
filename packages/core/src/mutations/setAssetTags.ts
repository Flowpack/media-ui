import { gql } from '@apollo/client';

const SET_ASSET_TAGS = gql`
    mutation SetAssetTags($id: AssetId!, $assetSourceId: AssetSourceId!, $tagIds: [TagId!]!) {
        setAssetTags(id: $id, assetSourceId: $assetSourceId, tagIds: $tagIds) {
            success
            messages
        }
    }
`;

export default SET_ASSET_TAGS;
