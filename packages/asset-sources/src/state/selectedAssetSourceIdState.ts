import { atom, selector } from 'recoil';

import { constraintsState, currentPageState, localStorageEffect } from '@media-ui/core/src/state';
import { clipboardVisibleState } from '@media-ui/feature-clipboard';

export const NEOS_ASSET_SOURCE = 'neos';

const selectedAssetSourceIdInternalState = atom<AssetSourceId>({
    key: 'SelectedAssetSourceIdInternalState',
    default: NEOS_ASSET_SOURCE,
    effects: [localStorageEffect('SelectedAssetSourceIdState')],
});

/**
 * Provides the selected asset source id with a fallback based on the constraints
 */
export const selectedAssetSourceIdState = selector<AssetSourceId>({
    key: 'SelectedAssetSourceIdState',
    get: ({ get }) => {
        const selectedAssetSourceId = get(selectedAssetSourceIdInternalState);
        const constraints = get(constraintsState);

        if (constraints.assetSources?.length > 0 && !constraints.assetSources.includes(selectedAssetSourceId)) {
            return constraints.assetSources[0];
        }
        return selectedAssetSourceId;
    },
    set: ({ set }, newValue) => {
        set(selectedAssetSourceIdInternalState, newValue);
        // Reset the current page to 1 when switching asset sources
        set(currentPageState, 1);
        // Hide the clipboard when switching asset sources
        set(clipboardVisibleState, false);
    },
});
