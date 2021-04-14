import { gql } from '@apollo/client';

const ASSET_USAGE_FRAGMENT = gql`
    fragment AssetUsageProps on AssetUsage {
        assetId
        label
        metadata
        serviceId
    }
`;

export default ASSET_USAGE_FRAGMENT;
