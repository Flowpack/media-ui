import { gql } from 'apollo-boost';

export const CONFIG = gql`
    query CONFIG {
        config {
            uploadMaxFileSize
        }
    }
`;
