import { gql } from '@apollo/client';

const UPLOAD_FILES = gql`
    mutation UploadFiles(
        $files: [UploadedFileInput!]!
        $assetSourceId: AssetSourceId!
        $tagId: TagId
        $assetCollectionId: AssetCollectionId
    ) {
        uploadFiles(
            files: $files
            assetSourceId: $assetSourceId
            tagId: $tagId
            assetCollectionId: $assetCollectionId
        ) {
            filename
            success
            result
        }
    }
`;

export default UPLOAD_FILES;
