import { gql } from '@apollo/client';

import { TAG_FRAGMENT } from '../fragments/tag';

const TAGS = gql`
    query TAGS($assetSourceId: AssetSourceId!) {
        tags(assetSourceId: $assetSourceId) {
            ...TagProps
        }
    }
    ${TAG_FRAGMENT}
`;

export default TAGS;
