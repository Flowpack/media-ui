import { useQuery } from '@apollo/client';

import { ASSET_COLLECTIONS } from '../queries';
import { AssetCollection } from '../interfaces';

interface AssetCollectionsQueryResult {
    assetCollections: AssetCollection[];
}

export default function useAssetCollectionsQuery() {
    const { data, loading } = useQuery<AssetCollectionsQueryResult>(ASSET_COLLECTIONS);
    return { assetCollections: data?.assetCollections || [], loading };
}
