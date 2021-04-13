import { gql } from '@apollo/client';

import { TAG_FRAGMENT } from '../fragments/tag';

const TAGS = gql`
    query TAGS {
        tags {
            ...TagProps
        }
    }
    ${TAG_FRAGMENT}
`;

export default TAGS;
