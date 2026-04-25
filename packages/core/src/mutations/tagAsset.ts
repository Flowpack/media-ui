import { gql } from '@apollo/client';

const TAG_ASSET = gql`
    mutation TagAsset($id: AssetId!, $assetSourceId: AssetSourceId!, $tagId: TagId!) {
        tagAsset(id: $id, assetSourceId: $assetSourceId, tagId: $tagId) {
            success
            messages
        }
    }
`;

export default TAG_ASSET;
