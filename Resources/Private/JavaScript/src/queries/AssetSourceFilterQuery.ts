import { gql } from 'apollo-boost';

export const ASSET_SOURCE_FILTER = gql`
    query AssetSourceFilter {
        assetSourceFilter @client(always: true)
    }
`;

export const SET_ASSET_SOURCE_FILTER = gql`
    mutation SetAssetSourceFilter($assetSourceFilter: String) {
        setAssetSourceFilter(assetSourceFilter: $assetSourceFilter) @client
    }
`;
