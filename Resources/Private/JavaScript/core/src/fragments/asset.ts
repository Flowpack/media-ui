import { gql } from '@apollo/client';

import { TAG_FRAGMENT } from '@media-ui/feature-asset-tags/src/fragments/tag';

import { ASSET_SOURCE_FRAGMENT } from './assetSource';
import { IPTC_PROPERTY_FRAGMENT } from './iptcProperty';
import { FILE_FRAGMENT } from './file';

// TODO: Somehow extend `isInClipboard` from clipboard feature package

export const ASSET_FRAGMENT = gql`
    fragment AssetProps on Asset {
        id
        localId
        assetSource {
            ...AssetSourceProps
        }
        imported
        label
        caption
        filename
        tags {
            ...TagProps
        }
        collections {
            id
            title
        }
        copyrightNotice
        lastModified
        iptcProperties {
            ...IptcPropertyProps
        }
        width
        height
        file {
            ...FileProps
        }
        thumbnailUrl
        previewUrl
        isInClipboard @client
        isInUse @include(if: $includeUsage)
    }
    ${ASSET_SOURCE_FRAGMENT}
    ${IPTC_PROPERTY_FRAGMENT}
    ${FILE_FRAGMENT}
    ${TAG_FRAGMENT}
`;
