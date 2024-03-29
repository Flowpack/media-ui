import { gql } from '@apollo/client';

import { ASSET_COLLECTION_FRAGMENT } from '../fragments/assetCollection';

export const ASSET_COLLECTIONS = gql`
    query ASSET_COLLECTIONS {
        assetCollections {
            ...AssetCollectionProps
        }
    }
    ${ASSET_COLLECTION_FRAGMENT}
`;
