import { useQuery } from '@apollo/client';

import { CONFIG } from '../queries';

interface ConfigQueryResult {
    config: {
        uploadMaxFileSize: number;
        uploadMaxFileUploadLimit: number;
        currentServerTime: Date;
        uploadProperties: UploadPropertiesResult[];
    };
}
interface UploadPropertiesResult {
    name: string;
    show: boolean;
    required: boolean;
}

const useConfigQuery = () => {
    const { data, loading } = useQuery<ConfigQueryResult>(CONFIG);
    return { config: data?.config, loading };
};

export default useConfigQuery;
