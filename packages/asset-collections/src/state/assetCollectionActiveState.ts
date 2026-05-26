import { selectorFamily } from 'recoil';

import { selectedAssetCollectionAndTagState } from '@media-ui/core/src/state';

// This state selector provides the active state for each individual asset collection based on its tags
export const assetCollectionActiveState = selectorFamily<
    boolean,
    { assetCollectionId: AssetCollectionId; assetSourceId: AssetSourceId }
>({
    key: 'AssetCollectionActiveState',
    get:
        ({ assetCollectionId, assetSourceId }) =>
        ({ get }) => {
            const { assetCollectionId: selectedAssetCollectionId, tagId: selectedTagId } = get(
                selectedAssetCollectionAndTagState(assetSourceId)
            );
            return assetCollectionId === selectedAssetCollectionId && !!selectedTagId;
        },
});
