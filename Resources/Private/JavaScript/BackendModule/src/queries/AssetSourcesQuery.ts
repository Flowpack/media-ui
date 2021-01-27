import gql from 'graphql-tag';

import { ASSET_SOURCE_FRAGMENT } from './Fragments';

const ASSET_SOURCES = gql`
    query ASSET_SOURCES {
        assetSources {
            ...AssetSourceProps
        }
    }
    ${ASSET_SOURCE_FRAGMENT}
`;

export default ASSET_SOURCES;
