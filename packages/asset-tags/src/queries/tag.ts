import { gql } from '@apollo/client';

import { TAG_FRAGMENT } from '../fragments/tag';

const TAG = gql`
    query TAG($id: TagId!, $assetSourceId: AssetSourceId!) {
        tag(id: $id, assetSourceId: $assetSourceId) {
            ...TagProps
        }
    }
    ${TAG_FRAGMENT}
`;

export default TAG;
