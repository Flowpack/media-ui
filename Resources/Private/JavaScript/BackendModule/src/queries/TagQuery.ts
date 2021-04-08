import { gql } from '@apollo/client';

import { TAG_FRAGMENT } from './Fragments';

const TAG = gql`
    query TAG($id: TagId!) {
        tag(id: $id) {
            ...TagProps
        }
    }
    ${TAG_FRAGMENT}
`;

export default TAG;
