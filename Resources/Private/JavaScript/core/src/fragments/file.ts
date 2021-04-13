import { gql } from '@apollo/client';

export const FILE_FRAGMENT = gql`
    fragment FileProps on File {
        extension
        mediaType
        typeIcon {
            url
            alt
        }
        size
        url
    }
`;
