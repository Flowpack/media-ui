import { gql } from '@apollo/client';

import { ASSET_FRAGMENT } from '../fragments/asset';

const UNTAG_ASSET = gql`
    mutation UntagAsset($id: AssetId!, $assetSourceId: AssetSourceId!, $tagId: TagId!, $includeUsage: Boolean = false) {
        includeUsage @client(always: true) @export(as: "includeUsage")
        untagAsset(id: $id, assetSourceId: $assetSourceId, tagId: $tagId) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;

export default UNTAG_ASSET;
