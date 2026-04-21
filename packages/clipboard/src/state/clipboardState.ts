import { atom, selector, selectorFamily } from 'recoil';

import { localStorageEffect } from '@media-ui/core/src/state/localStorageEffect';
import { selectedAssetIdsState } from '@media-ui/core/src/state';

/**
 * The clipboard state contains a list of asset identities
 */
export const clipboardState = atom<AssetIdentity[]>({
    key: 'ClipboardState',
    default: [],
    effects: [localStorageEffect('ClipboardState')],
});

/**
 * Returns the current clipboard state for a given asset and the setter toggles the state
 */
export const clipboardItemState = selectorFamily<boolean, { assetId: string; assetSourceId: string }>({
    key: 'ClipboardItemState',
    get:
        (assetIdentity) =>
        ({ get }) =>
            get(clipboardState).find(
                ({ assetId, assetSourceId }) =>
                    assetId === assetIdentity.assetId && assetSourceId === assetIdentity.assetSourceId
            ) !== undefined,
    set:
        (assetIdentity) =>
        ({ set }) => {
            set(clipboardState, (prevState: AssetIdentity[]) => {
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
export const clipboardItemsState = selector<boolean>({
    key: 'ClipboardItemsState',
    get: ({ get }) => {
        const selectedAssets = get(selectedAssetIdsState);
        if (selectedAssets.length === 0) return false;
        const clipboard = get(clipboardState);
        return selectedAssets.every((selected) =>
            clipboard.some((c) => c.assetId === selected.assetId && c.assetSourceId === selected.assetSourceId)
        );
    },
    set: ({ get, set }) => {
        const selectedAssets = get(selectedAssetIdsState);
        const clipboard = get(clipboardState);
        const allInClipboard = selectedAssets.every((selected) =>
            clipboard.some((c) => c.assetId === selected.assetId && c.assetSourceId === selected.assetSourceId)
        );

        if (allInClipboard) {
            set(
                clipboardState,
                clipboard.filter(
                    (c) => !selectedAssets.some((s) => s.assetId === c.assetId && s.assetSourceId === c.assetSourceId)
                )
            );
        } else {
            const toAdd = selectedAssets.filter(
                (s) => !clipboard.some((c) => c.assetId === s.assetId && c.assetSourceId === s.assetSourceId)
            );
            set(clipboardState, [...clipboard, ...toAdd]);
        }
    },
});
