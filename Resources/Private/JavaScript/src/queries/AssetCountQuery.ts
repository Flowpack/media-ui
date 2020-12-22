import gql from 'graphql-tag';

const ASSET_COUNT = gql`
    query ASSET_COUNT(
        $searchTerm: String
        $assetSourceId: AssetSourceId
        $assetCollectionId: AssetCollectionId
        $mediaType: MediaType
        $tagId: TagId
    ) {
        selectedAssetSourceId @client(always: true) @export(as: "assetSourceId")
        assetCount(
            searchTerm: $searchTerm
            assetSourceId: $assetSourceId
            assetCollectionId: $assetCollectionId
            mediaType: $mediaType
            tagId: $tagId
        )
    }
`;

export default ASSET_COUNT;
