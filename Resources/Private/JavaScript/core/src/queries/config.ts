import { gql } from '@apollo/client';

const CONFIG = gql`
    query CONFIG {
        config {
            uploadMaxFileSize
        }
    }
`;

export default CONFIG;
