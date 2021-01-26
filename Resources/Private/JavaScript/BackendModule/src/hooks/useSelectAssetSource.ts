import { useMutation, useQuery } from '@apollo/react-hooks';
import { ExecutionResult } from 'graphql';

import { SELECTED_ASSET_SOURCE_ID, SET_SELECTED_ASSET_SOURCE_ID } from '../queries';
import { AssetSource } from '../interfaces';
import { useAssetSourcesQuery } from './index';
import { useCallback, useMemo } from 'react';

const useSelectAssetSource = (): [AssetSource, (assetSource: AssetSource) => Promise<ExecutionResult<any>>] => {
    const selectedAssetSourceQuery = useQuery(SELECTED_ASSET_SOURCE_ID);
    const { selectedAssetSourceId } = selectedAssetSourceQuery.data;
    const { assetSources } = useAssetSourcesQuery();
    const selectedAssetSource = useMemo(
        () => assetSources.find(assetSource => assetSource.id === selectedAssetSourceId),
        [assetSources, selectedAssetSourceId]
    );

    const [mutateSelectedAssetSourceId] = useMutation(SET_SELECTED_ASSET_SOURCE_ID);
    const setSelectedAssetSource = useCallback(
        (assetSource: AssetSource) => {
            return mutateSelectedAssetSourceId({
                variables: { selectedAssetSourceId: assetSource.id }
            });
        },
        [mutateSelectedAssetSourceId]
    );
    return [selectedAssetSource, setSelectedAssetSource];
};

export default useSelectAssetSource;
