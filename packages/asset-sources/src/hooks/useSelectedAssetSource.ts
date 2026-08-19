import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { useAssetSourcesQuery } from './useAssetSourcesQuery';
import { selectedAssetSourceIdState } from '../state/selectedAssetSourceIdState';

export const useSelectedAssetSource = (): AssetSource => {
    const selectedAssetSourceId = useRecoilValue(selectedAssetSourceIdState);
    const { assetSources } = useAssetSourcesQuery();
    return useMemo(
        () => assetSources.find((assetSource) => assetSource.id === selectedAssetSourceId),
        [assetSources, selectedAssetSourceId]
    );
};
