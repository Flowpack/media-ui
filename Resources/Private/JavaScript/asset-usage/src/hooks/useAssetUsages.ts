import { useQuery } from '@apollo/client';

import ASSET_USAGE_DETAILS from '../queries/assetUsages';
import { UsageDetailsGroup } from '../interfaces/UsageDetails';

interface AssetUsagesQueryResult {
    assetUsageDetails: UsageDetailsGroup[];
}

export default function useAssetUsagesQuery(assetIdentity: AssetIdentity) {
    const { data, loading } = useQuery<AssetUsagesQueryResult>(ASSET_USAGE_DETAILS, {
        variables: { id: assetIdentity?.assetId, assetSourceId: assetIdentity?.assetSourceId },
        skip: !assetIdentity,
    });
    return { assetUsageDetails: data?.assetUsageDetails || null, loading };
}
