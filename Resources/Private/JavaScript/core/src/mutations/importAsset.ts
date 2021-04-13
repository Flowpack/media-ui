import { gql } from '@apollo/client';

import { ASSET_FRAGMENT } from '../fragments/asset';

const IMPORT_ASSET = gql`
    mutation ImportAsset($id: AssetId!, $assetSourceId: AssetSourceId!) {
        importAsset(id: $id, assetSourceId: $assetSourceId) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;

export default IMPORT_ASSET;
