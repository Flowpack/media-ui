import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { useAssetSourcesQuery } from './useAssetSourcesQuery';
import { selectedAssetSourceState } from '../state/selectedAssetSourceState';

export const useSelectedAssetSource = (): AssetSource => {
    const selectedAssetSourceId = useRecoilValue(selectedAssetSourceState);
    const { assetSources } = useAssetSourcesQuery();
    return useMemo(
        () => assetSources.find((assetSource) => assetSource.id === selectedAssetSourceId),
        [assetSources, selectedAssetSourceId]
    );
};
