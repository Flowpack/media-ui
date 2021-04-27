import { gql } from '@apollo/client';

export const CLIPBOARD = gql`
    query Clipboard {
        clipboard @client(always: true)
    }
`;

export const TOGGLE_CLIPBOARD_STATE = gql`
    mutation ToggleClipboardState($assetId: AssetId, $assetSourceId: AssetSourceId, $force: Boolean) {
        toggleClipboardState(assetId: $assetId, assetSourceId: $assetSourceId, force: $force) @client
    }
`;
