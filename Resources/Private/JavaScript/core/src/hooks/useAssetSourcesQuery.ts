import { useMemo } from 'react';
import { useQuery } from '@apollo/client';

import { ASSET_SOURCES } from '../queries';
import { AssetSource } from '../interfaces';
import { useMediaUi } from '../provider';

interface AssetSourcesQueryResult {
    assetSources: AssetSource[];
}

export default function useAssetSourcesQuery() {
    const { constraints } = useMediaUi();
    const { data, loading } = useQuery<AssetSourcesQueryResult>(ASSET_SOURCES);

    // Filter out sources that don't match the constraints
    const assetSources = useMemo(() => {
        const assetSources = data?.assetSources || [];
        return constraints.assetSources
            ? assetSources.filter((source) => {
                  return constraints.assetSources.includes(source.id);
              })
            : assetSources;
    }, [data?.assetSources, constraints.assetSources]);

    // TODO: Handle error if no asset sources are available

    return { assetSources, loading };
}
