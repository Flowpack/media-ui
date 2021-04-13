import { gql } from '@apollo/client';

import { ASSET_FRAGMENT } from '../fragments/asset';

const SET_ASSET_TAGS = gql`
    mutation SetAssetTags($id: AssetId!, $assetSourceId: AssetSourceId!, $tagIds: [TagId!]!) {
        setAssetTags(id: $id, assetSourceId: $assetSourceId, tagIds: $tagIds) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;

export default SET_ASSET_TAGS;
