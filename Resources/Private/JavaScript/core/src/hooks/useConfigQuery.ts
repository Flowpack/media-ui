import { useQuery } from '@apollo/client';

import { CONFIG } from '../queries';

interface ConfigQueryResult {
    config: {
        uploadMaxFileSize: number;
        uploadMaxFileUploadLimit: number;
        currentServerTime: Date;
        canManageAssetCollections: boolean;
        canManageTags: boolean;
        canManageAssets: boolean;
    };
}

const DEFAULT_CONFIG: ConfigQueryResult = {
    config: {
        uploadMaxFileSize: 0,
        uploadMaxFileUploadLimit: 0,
        currentServerTime: new Date(),
        canManageAssetCollections: false,
        canManageTags: false,
        canManageAssets: false,
    },
};

const useConfigQuery = () => {
    const { data, loading } = useQuery<ConfigQueryResult>(CONFIG);
    return { config: { ...DEFAULT_CONFIG, ...data?.config }, loading };
};

export default useConfigQuery;
