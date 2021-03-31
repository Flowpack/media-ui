import { gql } from '@apollo/client';

import { ASSET_FRAGMENT } from '@media-ui/core/src/fragments/asset';

const SIMILAR_ASSETS = gql`
    query SIMILAR_ASSETS($id: AssetId!, $assetSourceId: AssetSourceId!, $includeUsage: Boolean = false) {
        includeUsage @client(always: true) @export(as: "includeUsage")
        similarAssets(id: $id, assetSourceId: $assetSourceId) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;

export default SIMILAR_ASSETS;
