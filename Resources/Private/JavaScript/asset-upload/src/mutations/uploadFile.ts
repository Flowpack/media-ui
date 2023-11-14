import { gql } from '@apollo/client';

const UPLOAD_FILE = gql`
    mutation UploadFile($file: Upload!, $tagId: TagId, $assetCollectionId: AssetCollectionId) {
        uploadFile(file: $file, tagId: $tagId, assetCollectionId: $assetCollectionId) {
            filename
            success
            result
            assetId
        }
    }
`;

export default UPLOAD_FILE;
