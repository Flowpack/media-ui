import gql from 'graphql-tag';

export const SELECTED_ASSET_SOURCE_ID = gql`
    query SelectedAssetSourceId {
        selectedAssetSourceId @client(always: true)
    }
`;

export const SET_SELECTED_ASSET_SOURCE_ID = gql`
    mutation SetSelectedAssetSourceId($selectedAssetSourceId: String) {
        setSelectedAssetSourceId(selectedAssetSourceId: $selectedAssetSourceId) @client
    }
`;
