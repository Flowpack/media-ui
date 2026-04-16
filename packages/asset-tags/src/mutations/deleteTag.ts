import { gql } from '@apollo/client';

const DELETE_TAG = gql`
    mutation DeleteTag($id: TagId!, $assetSourceId: AssetSourceId!) {
        deleteTag(id: $id, assetSourceId: $assetSourceId) {
            success
            messages
        }
    }
`;

export default DELETE_TAG;
