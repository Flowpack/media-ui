import { gql } from '@apollo/client';

import { ASSET_SOURCE_FRAGMENT } from '../fragments/assetSource';

export const ASSET_SOURCES = gql`
    query ASSET_SOURCES {
        assetSources {
            ...AssetSourceProps
        }
    }
    ${ASSET_SOURCE_FRAGMENT}
`;
