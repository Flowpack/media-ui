import { gql } from '@apollo/client';

const DELETE_TAG = gql`
    mutation DeleteTag($id: TagId!) {
        deleteTag(id: $id) {
            success
            messages
        }
    }
`;

export default DELETE_TAG;
