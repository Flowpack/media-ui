import { gql } from '@apollo/client';

const SET_ASSET_COLLECTIONS = gql`
    mutation SetAssetCollections(
        $id: AssetId!
        $assetSourceId: AssetSourceId!
        $assetCollectionIds: [AssetCollectionId!]!
    ) {
        setAssetCollections(id: $id, assetSourceId: $assetSourceId, assetCollectionIds: $assetCollectionIds)
    }
`;

export default SET_ASSET_COLLECTIONS;
