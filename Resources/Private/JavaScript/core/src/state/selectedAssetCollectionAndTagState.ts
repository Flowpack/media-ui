import { selector } from 'recoil';

import { selectedTagIdState } from '@media-ui/feature-asset-tags';
import { selectedAssetCollectionIdState } from '@media-ui/feature-asset-collections';
import { clipboardVisibleState } from '@media-ui/feature-clipboard';

import currentPageState from './currentPageState';
import selectedInspectorViewState from './selectedInspectorViewState';
import selectedAssetIdState from './selectedAssetIdState';

// This is a proxy for setting the selected tag id, which also executes side effects to update other state
// By setting the other state in a selector, we can ensure that the state is updated all at once
export const selectedAssetCollectionAndTagState = selector<{ tagId: string | null; assetCollectionId: string | null }>({
    key: 'SelectedTagIdProxySelector',
    get: ({ get }) => ({
        tagId: get(selectedTagIdState),
        assetCollectionId: get(selectedAssetCollectionIdState),
    }),
    set: ({ set }, props: { tagId: string | null; assetCollectionId: string | null }) => {
        set(selectedInspectorViewState, 'tag');
        set(selectedTagIdState, props.tagId);
        set(selectedAssetIdState, null);
        set(currentPageState, 1);
        set(selectedAssetCollectionIdState, props.assetCollectionId);
        set(clipboardVisibleState, false);
    },
});
