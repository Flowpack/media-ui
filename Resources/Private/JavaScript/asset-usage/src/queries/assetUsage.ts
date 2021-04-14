import { gql } from '@apollo/client';

import ASSET_USAGE_FRAGMENT from '../fragments/assetUsage';

const ASSET_USAGE = gql`
    query ASSET_USAGE($id: AssetId!, $assetSourceId: AssetSourceId!) {
        assetUsages(id: $id, assetSourceId: $assetSourceId) {
            ...AssetUsageProps
        }
    }
    ${ASSET_USAGE_FRAGMENT}
`;

export default ASSET_USAGE;
