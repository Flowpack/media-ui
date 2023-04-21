import { gql } from '@apollo/client';

import { ASSET_COLLECTION_FRAGMENT } from '../fragments/assetCollection';

export const ASSET_COLLECTION = gql`
    query ASSET_COLLECTION($id: AssetCollectionId!) {
        assetCollection(id: $id) {
            ...AssetCollectionProps
        }
    }
    ${ASSET_COLLECTION_FRAGMENT}
`;
