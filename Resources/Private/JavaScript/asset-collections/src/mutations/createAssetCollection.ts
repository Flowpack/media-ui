import { gql } from '@apollo/client';

import { ASSET_COLLECTION_FRAGMENT } from '../fragments/assetCollection';

export const CREATE_ASSET_COLLECTION = gql`
    mutation CreateAssetCollection($title: String!, $parent: AssetCollectionId) {
        createAssetCollection(title: $title, parent: $parent) {
            ...AssetCollectionProps
        }
    }
    ${ASSET_COLLECTION_FRAGMENT}
`;
