import { gql } from '@apollo/client';

const UPLOAD_FILE = gql`
    mutation UploadFile(
        $file: UploadedFileInput!
        $assetSourceId: AssetSourceId!
        $tagId: TagId
        $assetCollectionId: AssetCollectionId
    ) {
        uploadFile(file: $file, assetSourceId: $assetSourceId, tagId: $tagId, assetCollectionId: $assetCollectionId) {
            filename
            success
            result
        }
    }
`;

export default UPLOAD_FILE;
