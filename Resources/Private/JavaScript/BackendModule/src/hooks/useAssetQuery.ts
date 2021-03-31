import { useQuery } from '@apollo/client';

import { ASSET } from '../queries';
import { Asset, AssetIdentity } from '../interfaces';

interface AssetQueryResult {
    asset: Asset;
}

export default function useAssetQuery(assetIdentity: AssetIdentity) {
    const { data, loading } = useQuery<AssetQueryResult>(ASSET, {
        variables: { id: assetIdentity?.assetId, assetSourceId: assetIdentity?.assetSourceId },
        skip: !assetIdentity,
    });
    return { asset: data?.asset || null, loading };
}
