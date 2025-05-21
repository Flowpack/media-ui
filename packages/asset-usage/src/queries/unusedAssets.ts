import { gql } from '@apollo/client';

import { ASSET_FRAGMENT } from '@media-ui/core/src/fragments/asset';

const UNUSED_ASSETS = gql`
    query UNUSED_ASSETS($limit: Int, $offset: Int, $includeUsage: Boolean = false) {
        includeUsage @client(always: true) @export(as: "includeUsage")
        unusedAssets(limit: $limit, offset: $offset) {
            ...AssetProps
            isInUse @include(if: $includeUsage)
        }
    }
    ${ASSET_FRAGMENT}
`;

export default UNUSED_ASSETS;
