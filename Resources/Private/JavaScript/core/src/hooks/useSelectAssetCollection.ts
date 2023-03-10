import { useCallback } from 'react';
import { selector, useSetRecoilState } from 'recoil';

import { clipboardVisibleState } from '@media-ui/feature-clipboard';
import { selectedTagIdState } from '@media-ui/feature-asset-tags';
import { AssetCollection, selectedAssetCollectionIdState } from '@media-ui/feature-asset-collections';

import { selectedInspectorViewState, selectedAssetIdState, currentPageState } from '../state';

// This is a proxy for setting the selected asset collection id, which also executes side effects to update other state
// By setting the other state in a selector, we can ensure that the state is updated all at once
const selectedAssetCollectionIdProxySelector = selector<null | string>({
    key: 'SelectedAssetCollectionIdProxySelector',
    get: ({ get }) => get(selectedAssetCollectionIdState),
    set: ({ set }, assetCollectionId: string) => {
        set(selectedInspectorViewState, 'assetCollection');
        set(selectedTagIdState, null);
        set(selectedAssetIdState, null);
        set(currentPageState, 1);
        set(selectedAssetCollectionIdState, assetCollectionId);
        set(clipboardVisibleState, false);
    },
});

// TODO: Move this hook into the asset collections package when the side effects can be triggered indirectly
const useSelectAssetCollection = () => {
    const setSelectedAssetCollectionIdWithSideEffects = useSetRecoilState(selectedAssetCollectionIdProxySelector);

    return useCallback(
        (assetCollection: AssetCollection) => {
            setSelectedAssetCollectionIdWithSideEffects(assetCollection?.id);
        },
        [setSelectedAssetCollectionIdWithSideEffects]
    );
};
export default useSelectAssetCollection;
