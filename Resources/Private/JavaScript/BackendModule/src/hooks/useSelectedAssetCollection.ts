import { useRecoilValue } from 'recoil';
import { useQuery } from '@apollo/client';

import { AssetCollection } from '../interfaces';
import { selectedAssetCollectionIdState } from '../state';
import { TAG } from '../queries';

interface AssetCollectionQueryResult {
    assetCollection: AssetCollection;
}

const useSelectedAssetCollection = (): AssetCollection => {
    const selectedAssetCollectionId = useRecoilValue(selectedAssetCollectionIdState);

    const { data } = useQuery<AssetCollectionQueryResult>(TAG, {
        variables: { id: selectedAssetCollectionId },
        skip: !selectedAssetCollectionId,
    });

    return data?.assetCollection || null;
};

export default useSelectedAssetCollection;
