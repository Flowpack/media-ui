import gql from 'graphql-tag';

export const CONFIG = gql`
    query CONFIG {
        config {
            uploadMaxFileSize
        }
    }
`;
