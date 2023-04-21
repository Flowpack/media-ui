import { useQuery } from '@apollo/client';

import AssetCollection from '../interfaces/AssetCollection';
import { ASSET_COLLECTION } from '../queries/assetCollection';

interface AssetCollectionQueryResult {
    assetCollection: AssetCollection;
}

export const UNASSIGNED_COLLECTION_ID = 'UNASSIGNED';

export function useAssetCollectionQuery(assetCollectionId?: string) {
    const { data, loading, refetch } = useQuery<AssetCollectionQueryResult, { id: string }>(ASSET_COLLECTION, {
        variables: { id: assetCollectionId },
        skip: !assetCollectionId || assetCollectionId === UNASSIGNED_COLLECTION_ID,
    });
    return { assetCollection: data?.assetCollection || null, loading, refetch };
}
