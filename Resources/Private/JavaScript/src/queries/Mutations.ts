import gql from 'graphql-tag';

import { ASSET_FRAGMENT, TAG_FRAGMENT } from './Fragments';

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

export const SET_ASSET_TAGS = gql`
    mutation SetAssetTags($id: AssetId!, $assetSourceId: AssetSourceId!, $tags: [TagLabel!]!) {
        setAssetTags(id: $id, assetSourceId: $assetSourceId, tags: $tags) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;

export const SET_ASSET_COLLECTIONS = gql`
    mutation SetAssetCollections(
        $id: AssetId!
        $assetSourceId: AssetSourceId!
        $assetCollections: [AssetCollectionTitle!]!
    ) {
        setAssetCollections(id: $id, assetSourceId: $assetSourceId, assetCollections: $assetCollections) {
            ...AssetProps
        }
    }
    ${ASSET_FRAGMENT}
`;

export const DELETE_TAG = gql`
    mutation DeleteTag($tag: TagLabel!) {
        deleteTag(tag: $tag)
    }
`;

export const CREATE_TAG = gql`
    mutation CreateTag($tag: TagLabel!) {
        createTag(tag: $tag) {
            ...TagProps
        }
    }
    ${TAG_FRAGMENT}
`;

export const REMOVE_TAG_FROM_ASSET_COLLECTION = gql`
    mutation RemoveTagFromAssetCollection($tag: TagLabel!, $assetCollection: AssetCollectionTitle!) {
        removeTagFromAssetCollection(tag: $tag, assetCollection: $assetCollection)
    }
`;

export const ADD_TAG_TO_ASSET_COLLECTION = gql`
    mutation RemoveTagFromAssetCollection($tag: TagLabel!, $assetCollection: AssetCollectionTitle!) {
        removeTagFromAssetCollection(tag: $tag, assetCollection: $assetCollection)
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
