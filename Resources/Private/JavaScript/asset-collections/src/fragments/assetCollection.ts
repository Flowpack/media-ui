import { gql } from '@apollo/client';
import { TAG_FRAGMENT } from '@media-ui/feature-asset-tags/src/fragments/tag';

export const ASSET_COLLECTION_FRAGMENT = gql`
    fragment AssetCollectionProps on AssetCollection {
        id
        title
        parent {
            id
            title
        }
        children {
            id
            title
        }
        tags {
            ...TagProps
        }
        assetCount
    }
    ${TAG_FRAGMENT}
`;
