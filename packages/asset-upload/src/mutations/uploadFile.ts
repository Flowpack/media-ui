import { gql } from '@apollo/client';

const UPLOAD_FILE = gql`
    mutation UploadFile(
        $file: UploadedFileInput!, 
        $tagId: TagId, 
        $assetSourceId: AssetSourceId!, 
        $assetCollectionId: AssetCollectionId
    ) {
        uploadFile(file: $file, tagId: $tagId, assetSourceId: $assetSourceId, assetCollectionId: $assetCollectionId) {
            filename
            success
            result
        }
    }
`;

export default UPLOAD_FILE;
