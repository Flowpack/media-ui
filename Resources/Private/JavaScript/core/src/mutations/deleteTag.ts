import { gql } from '@apollo/client';

const DELETE_TAG = gql`
    mutation DeleteTag($id: TagId!) {
        deleteTag(id: $id)
    }
`;

export default DELETE_TAG;
