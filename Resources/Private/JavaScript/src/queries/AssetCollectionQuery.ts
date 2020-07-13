import gql from 'graphql-tag';

import { ASSET_COLLECTION_FRAGMENT } from './Fragments';

const ASSET_COLLECTIONS = gql`
    query ASSET_COLLECTIONS {
        assetCollections {
            ...AssetCollectionProps
        }
    }
    ${ASSET_COLLECTION_FRAGMENT}
`;

export default ASSET_COLLECTIONS;
