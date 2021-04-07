import { gql } from '@apollo/client';

export const CONFIG = gql`
    query CONFIG {
        config {
            uploadMaxFileSize
        }
    }
`;
