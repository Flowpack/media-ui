import gql from 'graphql-tag';

const ASSET_COUNT = gql`
    query ASSET_COUNT(
        $searchTerm: String
        $assetSourceId: AssetSourceId
        $assetCollection: AssetCollectionTitle
        $mediaType: MediaType
        $tag: TagLabel
    ) {
        selectedAssetSourceId @client(always: true) @export(as: "assetSourceId")
        assetCount(
            searchTerm: $searchTerm
            assetSourceId: $assetSourceId
            assetCollection: $assetCollection
            mediaType: $mediaType
            tag: $tag
        )
    }
`;

export default ASSET_COUNT;
