import { useQuery } from '@apollo/client';

import { Asset, AssetIdentity } from '../interfaces';
import { ASSET } from '../queries';

interface AssetQueryResult {
    asset: Asset;
}

export default function useAssetQuery(assetIdentity?: AssetIdentity) {
    const { data, loading, refetch } = useQuery<AssetQueryResult, { id: string; assetSourceId: string }>(ASSET, {
        variables: { id: assetIdentity?.assetId, assetSourceId: assetIdentity?.assetSourceId },
        skip: !assetIdentity,
    });
    return { asset: data?.asset || null, loading, refetch };
}
