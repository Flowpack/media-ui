import { useQuery } from '@apollo/client';

import { ASSET_COLLECTION } from '../queries/assetCollection';

interface AssetCollectionQueryResult {
    assetCollection: AssetCollection;
}

export const UNASSIGNED_COLLECTION_ID = 'UNASSIGNED';

export function useAssetCollectionQuery(assetCollectionId: string | null, assetSourceId: AssetSourceId | null) {
    const { data, loading, refetch } = useQuery<
        AssetCollectionQueryResult,
        { id: AssetCollectionId; assetSourceId: AssetSourceId }
    >(ASSET_COLLECTION, {
        variables: { id: assetCollectionId, assetSourceId },
        skip: !assetCollectionId || !assetSourceId || assetCollectionId === UNASSIGNED_COLLECTION_ID,
    });
    return { assetCollection: data?.assetCollection || null, loading, refetch };
}
