import { selectorFamily } from 'recoil';

import { selectedTagIdState } from '@media-ui/feature-asset-tags';
import { selectedAssetCollectionIdState } from '@media-ui/feature-asset-collections';
import { clipboardVisibleState } from '@media-ui/feature-clipboard';

import { currentPageState } from './currentPageState';
import { selectedInspectorViewState } from './selectedInspectorViewState';
import { selectedAssetIdState } from './selectedAssetIdState';
import { selectedAssetIdsState } from './selectedAssetIdsState';

// This is a proxy for setting the selected tag id, which also executes side effects to update other state
// By setting the other state in a selector, we can ensure that the state is updated all at once
export const selectedAssetCollectionAndTagState = selectorFamily<
    { tagId: string | null; assetCollectionId: string | null },
    AssetSourceId
>({
    key: 'SelectedTagIdProxySelector',
    get:
        (assetSourceId: AssetSourceId) =>
        ({ get }) => ({
            tagId: get(selectedTagIdState(assetSourceId)),
            assetCollectionId: get(selectedAssetCollectionIdState(assetSourceId)),
        }),
    set:
        (assetSourceId: AssetSourceId) =>
        ({ get, set }, props: { tagId: string | null; assetCollectionId: string | null }) => {
            const isMultiSelection = get(selectedAssetIdsState(assetSourceId)).length > 1;
            if (!isMultiSelection) {
                set(selectedInspectorViewState, props.tagId ? 'tag' : 'assetCollection');
            }
            set(selectedTagIdState(assetSourceId), props.tagId);
            set(selectedAssetIdState, null);
            set(currentPageState, 1);
            set(selectedAssetCollectionIdState(assetSourceId), props.assetCollectionId);
            set(clipboardVisibleState, false);
        },
});
