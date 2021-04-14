import { useQuery } from '@apollo/client';

import { AssetIdentity } from '@media-ui/core/src/interfaces';

import ASSET_USAGE from '../queries/assetUsage';
import AssetUsage from '../interfaces/AssetUsage';

interface AssetUsagesQueryResult {
    assetUsages: AssetUsage[];
}

export default function useAssetUsagesQuery(assetIdentity: AssetIdentity) {
    const { data, loading } = useQuery<AssetUsagesQueryResult>(ASSET_USAGE, {
        variables: { id: assetIdentity?.assetId, assetSourceId: assetIdentity?.assetSourceId },
        skip: !assetIdentity,
    });
    return { assetUsages: data?.assetUsages || null, loading };
}
