import { useQuery } from '@apollo/client';

import { ASSET_COLLECTIONS } from '../queries/assetCollections';

interface AssetCollectionsQueryResult {
    assetCollections: AssetCollection[];
}

export default function useAssetCollectionsQuery(assetSourceId?: AssetSourceId) {
    const { data, loading } = useQuery<AssetCollectionsQueryResult>(ASSET_COLLECTIONS, {
        variables: { assetSourceId },
        skip: !assetSourceId,
    });
    return { assetCollections: data?.assetCollections || [], loading };
}
