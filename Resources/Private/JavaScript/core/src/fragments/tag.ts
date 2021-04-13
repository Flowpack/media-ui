import { gql } from '@apollo/client';

export const TAG_FRAGMENT = gql`
    fragment TagProps on Tag {
        id
        label
        parent {
            label
        }
        children {
            label
        }
    }
`;
