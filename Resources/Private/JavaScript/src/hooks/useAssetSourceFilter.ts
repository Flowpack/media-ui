import { useMutation, useQuery } from '@apollo/react-hooks';
import { ExecutionResult } from 'graphql';

import { ASSET_SOURCE_FILTER, SET_ASSET_SOURCE_FILTER } from '../queries';
import { AssetSource } from '../interfaces';

const useAssetSourceFilter = (): [string, (assetSource: AssetSource) => Promise<ExecutionResult<any>>] => {
    const assetSourceFilterQuery = useQuery(ASSET_SOURCE_FILTER);
    const { assetSourceFilter } = assetSourceFilterQuery.data;
    const [mutateAssetSourceFilter] = useMutation(SET_ASSET_SOURCE_FILTER);
    const setAssetSourceFilter = (assetSource: AssetSource) =>
        mutateAssetSourceFilter({
            variables: { assetSourceFilter: assetSource.id }
        });
    return [assetSourceFilter, setAssetSourceFilter];
};

export default useAssetSourceFilter;
