import { selectorFamily } from 'recoil';

import { selectedAssetCollectionAndTagState } from '@media-ui/core/src/state';

// This state selector provides the active state for each individual asset collection based on its tags
export const assetCollectionActiveState = selectorFamily<boolean, string>({
    key: 'AssetCollectionActiveState',
    get:
        (assetCollectionId) =>
        ({ get }) => {
            const { assetCollectionId: selectedAssetCollectionId, tagId: selectedTagId } = get(
                selectedAssetCollectionAndTagState
            );
            return assetCollectionId === selectedAssetCollectionId && !!selectedTagId;
        },
});
