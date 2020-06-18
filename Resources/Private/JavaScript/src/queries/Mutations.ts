import { gql } from 'apollo-boost';

import { ASSET_FRAGMENT } from './Fragments';

export const UPDATE_ASSET = gql`
    mutation UpdateAsset(
        $id: AssetId!
        $assetSourceId: AssetSourceId!
        $label: String
        $caption: String
        $copyrightNotice: String
    ) {
        updateAsset(
            id: $id
            assetSourceId: $assetSourceId
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
    mutation DeleteAsset($id: AssetId!, $assetSourceId: AssetSourceId!) {
        deleteAsset(id: $id, assetSourceId: $assetSourceId)
    }
`;

export const TAG_ASSET = gql`
    mutation TagAsset($id: AssetId!, $assetSourceId: AssetSourceId!, $tag: TagLabel!) {
        tagAsset(id: $id, assetSourceId: $assetSourceId, tag: $tag) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;

export const UNTAG_ASSET = gql`
    mutation UntagAsset($id: AssetId!, $assetSourceId: AssetSourceId!, $tag: TagLabel!) {
        untagAsset(id: $id, assetSourceId: $assetSourceId, tag: $tag) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;

export const UPLOAD_FILE = gql`
    mutation UploadFile($file: Upload!) {
        uploadFile(file: $file) {
            filename
            success
            result
        }
    }
`;

export const UPLOAD_FILES = gql`
    mutation UploadFiles($files: [Upload!]!) {
        uploadFiles(files: $files) {
            filename
            success
            result
        }
    }
`;

export const IMPORT_ASSET = gql`
    mutation ImportAsset($id: AssetId!, $assetSourceId: AssetSourceId!) {
        importAsset(id: $id, assetSourceId: $assetSourceId) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;
