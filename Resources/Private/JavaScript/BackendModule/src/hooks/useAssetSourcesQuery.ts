import { useQuery } from '@apollo/react-hooks';

import { ASSET_SOURCES } from '../queries';
import { AssetSource } from '../interfaces';

interface AssetSourcesQueryResult {
    assetSources: AssetSource[];
}

export default function useAssetSourcesQuery() {
    const { data, loading } = useQuery<AssetSourcesQueryResult>(ASSET_SOURCES);
    return { assetSources: data?.assetSources || [], loading };
}
