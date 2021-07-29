import { useMutation, useQuery } from '@apollo/client';
import { ExecutionResult } from 'graphql';

import { SELECTED_ASSET_SOURCE_ID, SET_SELECTED_ASSET_SOURCE_ID } from '../queries';
import { AssetSource } from '../interfaces';
import { useAssetSourcesQuery } from './index';
import { useCallback, useMemo } from 'react';
import { currentPageState } from '../state';
import { useSetRecoilState } from 'recoil';

const useSelectAssetSource = (): [AssetSource, (assetSource: AssetSource) => Promise<ExecutionResult<any>>] => {
    const selectedAssetSourceQuery = useQuery(SELECTED_ASSET_SOURCE_ID);
    const { selectedAssetSourceId } = selectedAssetSourceQuery.data;
    const { assetSources } = useAssetSourcesQuery();
    const setCurrentPage = useSetRecoilState(currentPageState);
    const selectedAssetSource = useMemo(
        () => assetSources.find((assetSource) => assetSource.id === selectedAssetSourceId),
        [assetSources, selectedAssetSourceId]
    );

    const [mutateSelectedAssetSourceId] = useMutation(SET_SELECTED_ASSET_SOURCE_ID);
    const setSelectedAssetSource = useCallback(
        (assetSource: AssetSource) => {
            setCurrentPage(1);
            return mutateSelectedAssetSourceId({
                variables: { selectedAssetSourceId: assetSource.id },
            });
        },
        [mutateSelectedAssetSourceId, setCurrentPage]
    );
    return [selectedAssetSource, setSelectedAssetSource];
};

export default useSelectAssetSource;
