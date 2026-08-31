import { selectorFamily } from 'recoil';

import { selectedAssetCollectionIdState } from './selectedAssetCollectionIdState';

// This state selector provides the focused state for each individual asset collection
export const assetCollectionFocusedState = selectorFamily<
    boolean,
    { assetCollectionId: AssetCollectionId; assetSourceId: AssetSourceId }
>({
    key: 'AssetCollectionFocusedState',
    get:
        ({ assetCollectionId, assetSourceId }) =>
        ({ get }) =>
            get(selectedAssetCollectionIdState(assetSourceId)) === assetCollectionId,
});
