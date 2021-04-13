import { gql } from '@apollo/client';
import { TAG_FRAGMENT } from './tag';

export const ASSET_COLLECTION_FRAGMENT = gql`
    fragment AssetCollectionProps on AssetCollection {
        id
        title
        tags {
            ...TagProps
        }
    }
    ${TAG_FRAGMENT}
`;
