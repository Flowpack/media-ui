import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { useQuery } from '@apollo/client';

import { constraintsState } from '@media-ui/core/src/state';

import { ASSET_SOURCES } from '../queries/assetSources';
import { AssetSource } from '../interfaces/AssetSource';

interface AssetSourcesQueryResult {
    assetSources: AssetSource[];
}

export function useAssetSourcesQuery() {
    const { data, loading } = useQuery<AssetSourcesQueryResult>(ASSET_SOURCES);
    const constraints = useRecoilValue(constraintsState);

    // Filter out sources that don't match the constraints
    const assetSources = useMemo(() => {
        const assetSources = data?.assetSources || [];
        return constraints.assetSources?.length > 0
            ? assetSources.filter((source) => {
                  return constraints.assetSources.includes(source.id);
              })
            : assetSources;
    }, [data?.assetSources, constraints.assetSources]);

    // TODO: Handle error if no asset sources are available

    return { assetSources, loading };
}
