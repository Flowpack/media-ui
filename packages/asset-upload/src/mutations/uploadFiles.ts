import { gql } from '@apollo/client';

const UPLOAD_FILES = gql`
    mutation UploadFiles($files: [UploadedFileInput!]!, $tagId: TagId, $assetCollectionId: AssetCollectionId) {
        uploadFiles(files: $files, tagId: $tagId, assetCollectionId: $assetCollectionId) {
            filename
            success
            result
        }
    }
`;

export default UPLOAD_FILES;
