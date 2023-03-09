import { useQuery } from '@apollo/client';

import AssetCollection from '../interfaces/AssetCollection';
import ASSET_COLLECTION from '../queries/assetCollection';

interface AssetCollectionQueryResult {
    assetCollection: AssetCollection;
}

export default function useAssetQuery(assetCollectionIdentity?: string) {
    const { data, loading, refetch } = useQuery<AssetCollectionQueryResult, { id: string }>(ASSET_COLLECTION, {
        variables: { id: assetCollectionIdentity },
        skip: !assetCollectionIdentity,
    });
    return { assetCollection: data?.assetCollection || null, loading, refetch };
}
