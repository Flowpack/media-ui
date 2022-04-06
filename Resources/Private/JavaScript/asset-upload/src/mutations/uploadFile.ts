import { gql } from '@apollo/client';

const UPLOAD_FILE = gql`
    mutation UploadFile($file: Upload!) {
        uploadFile(file: $file) {
            filename
            success
            result
        }
    }
`;

export default UPLOAD_FILE;
