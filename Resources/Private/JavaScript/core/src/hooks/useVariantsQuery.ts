import { useQuery } from '@apollo/client';

import { AssetIdentity, AssetVariant } from '../interfaces';
import { ASSET_VARIANTS } from '../queries';

interface VariantsQueryResult {
    assetVariants: AssetVariant;
}

export default function useVariantsQuery(assetIdentity?: AssetIdentity) {
    const { data, loading, refetch } = useQuery<VariantsQueryResult, { id: string; assetSourceId: string }>(
        ASSET_VARIANTS,
        {
            variables: { id: assetIdentity?.assetId, assetSourceId: assetIdentity?.assetSourceId },
            skip: !assetIdentity,
        }
    );
    return { variants: data?.assetVariants || null, loading, refetch };
}
