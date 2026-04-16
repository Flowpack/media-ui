import { gql } from '@apollo/client';

import { TAG_FRAGMENT } from '../fragments/tag';

const UPDATE_TAG = gql`
    mutation UpdateTag($id: TagId!, $assetSourceId: AssetSourceId!, $label: TagLabel!) {
        updateTag(id: $id, assetSourceId: $assetSourceId, label: $label) {
            ...TagProps
        }
    }
    ${TAG_FRAGMENT}
`;

export default UPDATE_TAG;
