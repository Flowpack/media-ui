import { gql } from '@apollo/client';

import { TAG_FRAGMENT } from '../fragments/tag';

const CREATE_TAG = gql`
    mutation CreateTag($label: TagLabel!, $assetSourceId: AssetSourceId!, $assetCollectionId: AssetCollectionId) {
        createTag(label: $label, assetSourceId: $assetSourceId, assetCollectionId: $assetCollectionId) {
            ...TagProps
        }
    }
    ${TAG_FRAGMENT}
`;

export default CREATE_TAG;
