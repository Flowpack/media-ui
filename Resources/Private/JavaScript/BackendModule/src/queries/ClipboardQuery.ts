import { gql } from '@apollo/client';

export const CLIPBOARD = gql`
    query Clipboard {
        clipboard @client(always: true)
    }
`;

export const ADD_OR_REMOVE_FROM_CLIPBOARD = gql`
    mutation AddOrRemoveFromClipboard($assetId: AssetId, $assetSourceId: AssetSourceId) {
        addOrRemoveFromClipboard(assetId: $assetId, assetSourceId: $assetSourceId) @client
    }
`;
