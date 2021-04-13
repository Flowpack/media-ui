import { gql } from '@apollo/client';

const UPLOAD_FILES = gql`
    mutation UploadFiles($files: [Upload!]!) {
        uploadFiles(files: $files) {
            filename
            success
            result
        }
    }
`;

export default UPLOAD_FILES;
