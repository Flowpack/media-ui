import { gql } from '@apollo/client';

import { TAG_FRAGMENT } from '../fragments/tag';

const UPDATE_TAG = gql`
    mutation UpdateTag($id: TagId!, $label: TagLabel!) {
        updateTag(id: $id, label: $label) {
            ...TagProps
        }
    }
    ${TAG_FRAGMENT}
`;

export default UPDATE_TAG;
