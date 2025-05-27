import { selectorFamily } from 'recoil';

import { selectedAssetCollectionIdState } from './selectedAssetCollectionIdState';

// This state selector provides the focused state for each individual asset collection
export const assetCollectionFocusedState = selectorFamily<boolean, string>({
    key: 'AssetCollectionFocusedState',
    get:
        (assetCollectionId) =>
        ({ get }) =>
            get(selectedAssetCollectionIdState) === assetCollectionId,
});
