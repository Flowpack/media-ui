import { useQuery } from '@apollo/client';

import { ASSET } from '../queries';

interface AssetQueryResult {
    asset: Asset;
}

export default function useAssetQuery(assetIdentity?: AssetIdentity | null) {
    const { data, loading, refetch } = useQuery<AssetQueryResult, { id: string; assetSourceId: string }>(ASSET, {
        variables: assetIdentity
            ? { id: assetIdentity.assetId, assetSourceId: assetIdentity.assetSourceId }
            : undefined,
        skip: !assetIdentity,
    });
    return { asset: data?.asset || null, loading, refetch };
}
