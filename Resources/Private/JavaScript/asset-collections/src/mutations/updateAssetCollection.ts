import { gql } from '@apollo/client';

import { ASSET_COLLECTION_FRAGMENT } from '../fragments/assetCollection';

const UPDATE_ASSET_COLLECTION = gql`
    mutation UpdateAssetCollection(
        $id: AssetCollectionId!
        $title: String
        $tagIds: [TagId]
        $parent: AssetCollectionId
    ) {
        updateAssetCollection(id: $id, title: $title, tagIds: $tagIds, parent: $parent) {
            ...AssetCollectionProps
        }
    }
    ${ASSET_COLLECTION_FRAGMENT}
`;

export default UPDATE_ASSET_COLLECTION;
