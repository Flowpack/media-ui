import { gql } from '@apollo/client';

import { ASSET_COLLECTION_FRAGMENT } from '../fragments/assetCollection';

const CREATE_ASSET_COLLECTION = gql`
    mutation CreateAssetCollection($title: String!) {
        createAssetCollection(title: $title) {
            ...AssetCollectionProps
        }
    }
    ${ASSET_COLLECTION_FRAGMENT}
`;

export default CREATE_ASSET_COLLECTION;
