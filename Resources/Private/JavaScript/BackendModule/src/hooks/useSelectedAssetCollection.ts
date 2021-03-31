import { useRecoilValue } from 'recoil';
import { useApolloClient } from '@apollo/client';

import { AssetCollection } from '../interfaces';
import { selectedAssetCollectionIdState } from '../state';
import { ASSET_COLLECTION_FRAGMENT } from '../queries';

const useSelectedAssetCollection = (): AssetCollection => {
    const client = useApolloClient();
    const selectedAssetCollectionId = useRecoilValue(selectedAssetCollectionIdState);

    // Read selection from cache as we can only select asset collections that have been queried before
    try {
        return client.readFragment(
            {
                id: `AssetCollection_${selectedAssetCollectionId}`,
                fragment: ASSET_COLLECTION_FRAGMENT,
                fragmentName: 'AssetCollectionProps'
            },
            true
        );
    } catch (e) {
        // TODO: Run query to get the asset collection when its not found
        console.error(e, 'selected asset collecion missing in cache');
    }

    return null;
};

export default useSelectedAssetCollection;
