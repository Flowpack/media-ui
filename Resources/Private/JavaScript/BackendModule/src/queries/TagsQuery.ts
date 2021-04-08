import { gql } from '@apollo/client';

import { TAG_FRAGMENT } from './Fragments';

const TAGS = gql`
    query TAGS {
        tags {
            ...TagProps
        }
    }
    ${TAG_FRAGMENT}
`;

export default TAGS;