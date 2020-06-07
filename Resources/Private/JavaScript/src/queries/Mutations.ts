import { gql } from 'apollo-boost';

import { ASSET_FRAGMENT } from './Fragments';

export const UPDATE_ASSET = gql`
    mutation UpdateAsset(
        $id: AssetId!
        $assetSource: AssetSourceId!
        $label: String
        $caption: String
        $copyrightNotice: String
    ) {
        updateAsset(
            id: $id
            assetSource: $assetSource
            label: $label
            caption: $caption
            copyrightNotice: $copyrightNotice
        ) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;

export const DELETE_ASSET = gql`
    mutation DeleteAsset($id: AssetId!, $assetSource: AssetSourceId!) {
        deleteAsset(id: $id, assetSource: $assetSource)
    }
`;

export const TAG_ASSET = gql`
    mutation TagAsset($id: AssetId!, $assetSource: AssetSourceId!, $tag: TagLabel!) {
        tagAsset(id: $id, assetSource: $assetSource, tag: $tag) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;

export const UNTAG_ASSET = gql`
    mutation UntagAsset($id: AssetId!, $assetSource: AssetSourceId!, $tag: TagLabel!) {
        untagAsset(id: $id, assetSource: $assetSource, tag: $tag) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;
