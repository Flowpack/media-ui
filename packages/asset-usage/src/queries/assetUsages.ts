import { gql } from '@apollo/client';

import ASSET_USAGES_DETAILS_FRAGMENT from '../fragments/usageDetailsGroupFragment';

const ASSET_USAGE_DETAILS = gql`
    query ASSET_USAGE_DETAILS($id: AssetId!, $assetSourceId: AssetSourceId!) {
        assetUsageDetails(id: $id, assetSourceId: $assetSourceId) {
            ...UsageDetailsGroupProps
        }
    }
    ${ASSET_USAGES_DETAILS_FRAGMENT}
`;

export default ASSET_USAGE_DETAILS;
