import { useMutation, useQuery } from '@apollo/react-hooks';
import { ASSET_SOURCE_FILTER, SET_ASSET_SOURCE_FILTER } from '../queries/AssetSourceFilterQuery';
import AssetSource from '../interfaces/AssetSource';
import { ExecutionResult } from 'graphql';

export const useAssetSourceFilter = (): [string, (assetSource: AssetSource) => Promise<ExecutionResult<any>>] => {
    const assetSourceFilterQuery = useQuery(ASSET_SOURCE_FILTER);
    const { assetSourceFilter } = assetSourceFilterQuery.data;
    const [mutateAssetSourceFilter] = useMutation(SET_ASSET_SOURCE_FILTER);
    const setAssetSourceFilter = (assetSource: AssetSource) =>
        mutateAssetSourceFilter({
            variables: { assetSourceFilter: assetSource.identifier }
        });
    return [assetSourceFilter, setAssetSourceFilter];
};
