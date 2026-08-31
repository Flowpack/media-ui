import { atomFamily, selectorFamily } from 'recoil';

import { localStorageEffect } from '@media-ui/core/src/state/localStorageEffect';
import { selectedAssetIdsState } from '@media-ui/core/src/state';

/**
 * The clipboard state contains a list of asset identities
 */
export const clipboardState = atomFamily<AssetIdentity[], AssetSourceId>({
    key: 'ClipboardState',
    default: [],
    effects: [localStorageEffect('ClipboardState')],
});

/**
 * Returns the current clipboard state for a given asset and the setter toggles the state
 */
export const clipboardItemState = selectorFamily<boolean, AssetIdentity>({
    key: 'ClipboardItemState',
    get:
        (assetIdentity) =>
        ({ get }) =>
            get(clipboardState(assetIdentity.assetSourceId)).find(
                ({ assetId, assetSourceId }) =>
                    assetId === assetIdentity.assetId && assetSourceId === assetIdentity.assetSourceId
            ) !== undefined,
    set:
        (assetIdentity) =>
        ({ set }) => {
            set(clipboardState(assetIdentity.assetSourceId), (prevState: AssetIdentity[]) => {
                // Check if the asset is already in the clipboard
                const assetInClipboardIndex = prevState.findIndex(
                    ({ assetId, assetSourceId }) =>
                        assetId === assetIdentity.assetId && assetSourceId === assetIdentity.assetSourceId
                );
                // If the asset is not in the clipboard, add it
                if (assetInClipboardIndex === -1) {
                    return [...prevState, assetIdentity];
                }
                // If it already is, remove the asset from the clipboard
                return prevState.filter(
                    ({ assetId, assetSourceId }) =>
                        assetId !== assetIdentity.assetId || assetSourceId !== assetIdentity.assetSourceId
                );
            });
        },
});

/**
 * Returns whether all selected assets are in the clipboard,
 * and toggles all of them at once.
 */
export const clipboardItemsState = selectorFamily<boolean, AssetSourceId>({
    key: 'ClipboardItemsState',
    get:
        (assetSourceId: AssetSourceId) =>
        ({ get }) => {
            const selectedAssets = get(selectedAssetIdsState(assetSourceId));
            if (selectedAssets.length === 0) return false;
            const clipboard = get(clipboardState(assetSourceId));
            return selectedAssets.every((selected) =>
                clipboard.some((c) => c.assetId === selected.assetId && c.assetSourceId === selected.assetSourceId)
            );
        },
    set:
        (assetSourceId: AssetSourceId) =>
        ({ get, set }) => {
            const selectedAssets = get(selectedAssetIdsState(assetSourceId));
            const clipboard = get(clipboardState(assetSourceId));
            const allInClipboard = selectedAssets.every((selected) =>
                clipboard.some((c) => c.assetId === selected.assetId && c.assetSourceId === selected.assetSourceId)
            );

            if (allInClipboard) {
                set(
                    clipboardState(assetSourceId),
                    clipboard.filter(
                        (c) =>
                            !selectedAssets.some((s) => s.assetId === c.assetId && s.assetSourceId === c.assetSourceId)
                    )
                );
            } else {
                const toAdd = selectedAssets.filter(
                    (s) => !clipboard.some((c) => c.assetId === s.assetId && c.assetSourceId === s.assetSourceId)
                );
                set(clipboardState(assetSourceId), [...clipboard, ...toAdd]);
            }
        },
});
