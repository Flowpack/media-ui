import { atom, selector } from 'recoil';

import { constraintsState, currentPageState, localStorageEffect } from '@media-ui/core/src/state';
import { clipboardVisibleState } from '@media-ui/feature-clipboard/src/index';

export const NEOS_ASSET_SOURCE = 'neos';

// TODO: Make sure that constraints are respected when restoring the state
const selectedAssetSourceIdState = atom<string>({
    key: 'SelectedAssetSourceIdState',
    default: NEOS_ASSET_SOURCE,
    effects: [localStorageEffect('SelectedAssetSourceIdState')],
});

export const selectedAssetSourceState = selector<string>({
    key: 'SelectedAssetSourceState',
    get: ({ get }) => {
        const selectedAssetSourceId = get(selectedAssetSourceIdState);
        const constraints = get(constraintsState);

        if (constraints.assetSources?.length > 0 && !constraints.assetSources.includes(selectedAssetSourceId)) {
            return constraints.assetSources[0];
        }
        return selectedAssetSourceId;
    },
    set: ({ set }, newValue) => {
        set(selectedAssetSourceIdState, newValue);
        // Reset the current page to 1 when switching asset sources
        set(currentPageState, 1);
        // Hide the clipboard when switching asset sources
        set(clipboardVisibleState, false);
    },
});
