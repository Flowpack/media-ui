import { gql } from '@apollo/client';

import { ASSET_FRAGMENT } from '../fragments/asset';

const TAG_ASSET = gql`
    mutation TagAsset($id: AssetId!, $assetSourceId: AssetSourceId!, $tagId: TagId!, $includeUsage: Boolean = false) {
        includeUsage @client @export(as: "includeUsage")
        tagAsset(id: $id, assetSourceId: $assetSourceId, tagId: $tagId) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;

export default TAG_ASSET;
