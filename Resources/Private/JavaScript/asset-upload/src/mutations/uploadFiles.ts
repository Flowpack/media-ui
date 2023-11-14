import { gql } from '@apollo/client';

const UPLOAD_FILES = gql`
    mutation UploadFiles(
        $files: [Upload!]!
        $tagId: TagId
        $assetCollectionId: AssetCollectionId
        $uploadProperties: [UploadProperties]
    ) {
        uploadFiles(
            files: $files
            tagId: $tagId
            assetCollectionId: $assetCollectionId
            uploadProperties: $uploadProperties
        ) {
            filename
            success
            result
            assetId
        }
    }
`;

export default UPLOAD_FILES;
