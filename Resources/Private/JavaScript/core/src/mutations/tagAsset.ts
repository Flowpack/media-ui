import { gql } from '@apollo/client';

import { ASSET_FRAGMENT } from '../fragments/asset';

const TAG_ASSET = gql`
    mutation TagAsset($id: AssetId!, $assetSourceId: AssetSourceId!, $tagId: TagId!) {
        tagAsset(id: $id, assetSourceId: $assetSourceId, tagId: $tagId) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;

export default TAG_ASSET;
