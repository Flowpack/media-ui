import { useQuery } from '@apollo/client';

import AssetVariant from '../interfaces/AssetVariant';
import ASSET_VARIANTS from '../queries/assetVariants';

interface VariantsQueryResult {
    assetVariants: AssetVariant[];
}

export default function useAssetVariants(assetIdentity?: AssetIdentity) {
    const { data, loading, refetch } = useQuery<VariantsQueryResult, { id: string; assetSourceId: string }>(
        ASSET_VARIANTS,
        {
            variables: { id: assetIdentity?.assetId, assetSourceId: assetIdentity?.assetSourceId },
            skip: !assetIdentity,
        }
    );
    return { variants: data?.assetVariants || null, loading, refetch };
}
