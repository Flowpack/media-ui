import { useQuery } from '@apollo/react-hooks';

import { ASSET_COUNT } from '../queries';

interface AssetCountQueryResult {
    assetCount: number;
}

export default function useAssetCountQuery() {
    const { data, loading } = useQuery<AssetCountQueryResult>(ASSET_COUNT);
    return { assetCount: data?.assetCount || 0, loading };
}
