import { gql } from '@apollo/client';

const CONFIG = gql`
    query CONFIG {
        config {
            uploadMaxFileSize
            uploadMaxFileUploadLimit
            currentServerTime
            uploadProperties {
                name
                show
                required
            }
        }
    }
`;

export default CONFIG;
