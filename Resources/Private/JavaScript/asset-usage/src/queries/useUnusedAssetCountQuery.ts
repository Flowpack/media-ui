import { useLazyQuery } from '@apollo/client';

import UNUSED_ASSET_COUNT from './unusedAssetCount';

interface UnusedAssetCountQueryResult {
    unusedAssetCount: number;
}

export default function useUnusedAssetCountQuery() {
    const [load, { called, loading, data }] = useLazyQuery<UnusedAssetCountQueryResult>(UNUSED_ASSET_COUNT);
    return { called, load, unusedAssetCount: data?.unusedAssetCount || 0, loading };
}
