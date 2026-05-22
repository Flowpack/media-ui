import { useRecoilValue } from 'recoil';
import { useQuery } from '@apollo/client';

import { selectedAssetSourceState } from '@media-ui/feature-asset-sources';

import { selectedAssetCollectionIdState } from '../state/selectedAssetCollectionIdState';
import { ASSET_COLLECTION } from '../queries/assetCollection';

interface AssetCollectionQueryResult {
    assetCollection: AssetCollection;
    assetSourceId?: AssetSourceId;
}

const useSelectedAssetCollection = (): AssetCollection => {
    const assetSourceId = useRecoilValue(selectedAssetSourceState);
    const selectedAssetCollectionId = useRecoilValue(selectedAssetCollectionIdState(assetSourceId));

    const { data } = useQuery<AssetCollectionQueryResult>(ASSET_COLLECTION, {
        variables: { id: selectedAssetCollectionId, assetSourceId },
        skip: !selectedAssetCollectionId,
    });

    return data?.assetCollection || null;
};

export default useSelectedAssetCollection;
