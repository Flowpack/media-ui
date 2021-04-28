import { gql } from '@apollo/client';

const CONFIG = gql`
    query CONFIG {
        config {
            uploadMaxFileSize
            currentServerTime
        }
    }
`;

export default CONFIG;
