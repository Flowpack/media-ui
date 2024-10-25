import { gql } from '@apollo/client';

const CONFIG = gql`
    query CONFIG {
        config {
            uploadMaxFileSize
            uploadMaxFileUploadLimit
            currentServerTime
            canManageAssetCollections
            canManageTags
            canManageAssets
        }
    }
`;

export default CONFIG;
