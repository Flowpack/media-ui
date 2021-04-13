import { useQuery } from '@apollo/client';

import { AssetCollection } from '../interfaces';
import { ASSET_COLLECTIONS } from '../queries';

interface AssetCollectionsQueryResult {
    assetCollections: AssetCollection[];
}

export default function useAssetCollectionsQuery() {
    const { data, loading } = useQuery<AssetCollectionsQueryResult>(ASSET_COLLECTIONS);
    return { assetCollections: data?.assetCollections || [], loading };
}
