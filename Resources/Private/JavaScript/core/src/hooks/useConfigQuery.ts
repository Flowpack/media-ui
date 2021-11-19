import { useQuery } from '@apollo/client';
import { CONFIG } from '../queries';

interface ConfigQueryResult {
    config: {
        maximumUploadFileSize: number;
        maximumUploadChunkSize: number;
        maximumUploadFileCount: number;
        currentServerTime: Date;
    };
}

const useConfigQuery = () => {
    const { data, loading } = useQuery<ConfigQueryResult>(CONFIG);
    return { config: data?.config, loading };
};

export default useConfigQuery;
