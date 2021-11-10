import { gql } from '@apollo/client';

const CONFIG = gql`
    query CONFIG {
        config {
            maximumUploadFileSize
            maximumUploadChunkSize
            maximumUploadFileCount
            currentServerTime
        }
    }
`;

export default CONFIG;
