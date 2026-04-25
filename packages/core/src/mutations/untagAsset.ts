import { gql } from '@apollo/client';

const UNTAG_ASSET = gql`
    mutation UntagAsset($id: AssetId!, $assetSourceId: AssetSourceId!, $tagId: TagId!) {
        untagAsset(id: $id, assetSourceId: $assetSourceId, tagId: $tagId) {
            success
            messages
        }
    }
`;

export default UNTAG_ASSET;
