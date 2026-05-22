import { atomFamily, selectorFamily } from 'recoil';

import { selectedAssetIdState } from './selectedAssetIdState';
import { selectedInspectorViewState } from './selectedInspectorViewState';

/**
 * Default value: if a single asset was persisted via selectedAssetIdState,
 * initialize the selection array with it on first load.
 */
const selectedAssetIdsDefaultState = selectorFamily<AssetId[], AssetSourceId>({
    key: 'SelectedAssetIdsDefaultState',
    get:
        (assetSourceId: AssetSourceId) =>
        ({ get }) => {
            const selectedAsset = get(selectedAssetIdState);
            return selectedAsset && selectedAsset.assetSourceId === assetSourceId ? [selectedAsset.assetId] : [];
        },
});

const selectedAssetIdsInternalState = atomFamily<AssetId[], AssetSourceId>({
    key: 'SelectedAssetIdsInternalState',
    default: selectedAssetIdsDefaultState,
});

/**
 * Writable selector that keeps selectedAssetIdState in sync.
 * When the selection changes:
 * - 1 asset: set it as the active asset in the inspector
 * - 0 or >1: clear the active asset
 */
export const selectedAssetIdsState = selectorFamily<AssetIdentity[], AssetSourceId>({
    key: 'SelectedAssetIdsState',
    get:
        (assetSourceId: AssetSourceId) =>
        ({ get }) =>
            get(selectedAssetIdsInternalState(assetSourceId)).map((assetId) => ({ assetId, assetSourceId })),
    set:
        (assetSourceId) =>
        ({ set }, newValue: AssetIdentity[]) => {
            set(
                selectedAssetIdsInternalState(assetSourceId),
                newValue.map(({ assetId }) => assetId)
            );
            if (newValue.length === 1) {
                set(selectedAssetIdState, newValue[0]);
                set(selectedInspectorViewState, 'asset');
            } else {
                set(selectedAssetIdState, null);
            }
        },
});

export const isAssetSelectedState = selectorFamily<boolean, { assetId: AssetId; assetSourceId: AssetSourceId }>({
    key: 'IsAssetSelectedState',
    get:
        (assetIdentity: AssetIdentity) =>
        ({ get }) =>
            get(selectedAssetIdsState(assetIdentity.assetSourceId)).some((a) => a.assetId === assetIdentity.assetId),
});
