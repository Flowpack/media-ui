import { useRecoilValue } from 'recoil';
import { useApolloClient } from '@apollo/client';

import { Asset } from '../interfaces';
import { selectedAssetIdState } from '../state';
import { ASSET_FRAGMENT } from '../queries';

const useSelectedAsset = (): Asset => {
    const client = useApolloClient();
    const selectedAssetId = useRecoilValue(selectedAssetIdState);

    // Read asset selection from cache as we can only select assets that have been queried before
    try {
        return client.readFragment(
            {
                id: `Asset_${selectedAssetId}`,
                fragment: ASSET_FRAGMENT,
                fragmentName: 'AssetProps'
            },
            true
        );
    } catch (e) {
        // TODO: Run query to get the asset when its not found
        console.error(e, 'selected asset missing in cache');
    }

    return null;
};

export default useSelectedAsset;
