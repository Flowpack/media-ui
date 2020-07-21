import gql from 'graphql-tag';

import { ASSET_FRAGMENT } from './Fragments';

export const ASSET = gql`
    query ASSET($id: AssetId!, $assetSourceId: AssetSourceId!) {
        selectedAssetSourceId @client(always: true) @export(as: "assetSourceId")
        asset(id: $id, assetSourceId: $assetSourceId) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;
