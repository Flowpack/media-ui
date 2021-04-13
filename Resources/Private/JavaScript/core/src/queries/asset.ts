import { gql } from '@apollo/client';

import { ASSET_FRAGMENT } from '../fragments/asset';

const ASSET = gql`
    query ASSET($id: AssetId!, $assetSourceId: AssetSourceId!) {
        asset(id: $id, assetSourceId: $assetSourceId) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;

export default ASSET;
