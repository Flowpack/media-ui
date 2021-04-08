import { useRecoilValue } from 'recoil';
import { useQuery } from '@apollo/client';

import { AssetCollection } from '../interfaces';
import { selectedAssetCollectionIdState } from '../state';
import ASSET_COLLECTION from '../queries/AssetCollectionQuery';

interface AssetCollectionQueryResult {
    assetCollection: AssetCollection;
}

const useSelectedAssetCollection = (): AssetCollection => {
    const selectedAssetCollectionId = useRecoilValue(selectedAssetCollectionIdState);

    const { data } = useQuery<AssetCollectionQueryResult>(ASSET_COLLECTION, {
        variables: { id: selectedAssetCollectionId },
        skip: !selectedAssetCollectionId,
    });

    return data?.assetCollection || null;
};

export default useSelectedAssetCollection;
