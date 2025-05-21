import { gql } from '@apollo/client';

const CONFIG = gql`
    query CONFIG {
        config {
            uploadMaxFileSize
            uploadMaxFileUploadLimit
            currentServerTime
            defaultAssetCollectionId
            canManageAssetCollections
            canManageTags
            canManageAssets
        }
    }
`;

export default CONFIG;
