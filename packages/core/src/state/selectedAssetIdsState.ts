import { atom, selector, selectorFamily } from 'recoil';

import { selectedAssetIdState } from './selectedAssetIdState';
import { selectedInspectorViewState } from './selectedInspectorViewState';

/**
 * Default value: if a single asset was persisted via selectedAssetIdState,
 * initialize the selection array with it on first load.
 */
const selectedAssetIdsDefaultState = selector<AssetIdentity[]>({
    key: 'SelectedAssetIdsDefaultState',
    get: ({ get }) => {
        const selectedAsset = get(selectedAssetIdState);
        return selectedAsset ? [selectedAsset] : [];
    },
});

const selectedAssetIdsInternalState = atom<AssetIdentity[]>({
    key: 'SelectedAssetIdsInternalState',
    default: selectedAssetIdsDefaultState,
});

/**
 * Writable selector that keeps selectedAssetIdState in sync.
 * When the selection changes:
 * - 1 asset: set it as the active asset in the inspector
 * - 0 or >1: clear the active asset
 */
export const selectedAssetIdsState = selector<AssetIdentity[]>({
    key: 'SelectedAssetIdsState',
    get: ({ get }) => get(selectedAssetIdsInternalState),
    set: ({ set }, newValue: AssetIdentity[]) => {
        set(selectedAssetIdsInternalState, newValue);
        if (newValue.length === 1) {
            set(selectedAssetIdState, newValue[0]);
            set(selectedInspectorViewState, 'asset');
        } else {
            set(selectedAssetIdState, null);
        }
    },
});

export const isAssetSelectedState = selectorFamily<boolean, string>({
    key: 'IsAssetSelectedState',
    get:
        (assetId) =>
        ({ get }) =>
            get(selectedAssetIdsState).some((a) => a.assetId === assetId),
});
