import { useQuery } from '@apollo/client';

import { CONFIG } from '../queries';

interface ConfigQueryResult {
    config: {
        uploadMaxFileSize: number;
    };
}

export default function useConfigQuery() {
    const { data, loading } = useQuery<ConfigQueryResult>(CONFIG);
    return { config: data?.config, loading };
}
