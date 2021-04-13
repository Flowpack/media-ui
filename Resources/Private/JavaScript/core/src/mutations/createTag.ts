import { gql } from '@apollo/client';

import { TAG_FRAGMENT } from '../fragments/tag';

const CREATE_TAG = gql`
    mutation CreateTag($label: TagLabel!, $assetCollectionId: AssetCollectionId) {
        createTag(label: $label, assetCollectionId: $assetCollectionId) {
            ...TagProps
        }
    }
    ${TAG_FRAGMENT}
`;

export default CREATE_TAG;
