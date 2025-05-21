import { gql } from '@apollo/client';

import { ASSET_FRAGMENT } from '../fragments/asset';

const SET_ASSET_TAGS = gql`
    mutation SetAssetTags(
        $id: AssetId!
        $assetSourceId: AssetSourceId!
        $tagIds: [TagId!]!
        $includeUsage: Boolean = false
    ) {
        includeUsage @client(always: true) @export(as: "includeUsage")
        setAssetTags(id: $id, assetSourceId: $assetSourceId, tagIds: $tagIds) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;

export default SET_ASSET_TAGS;
