import { atom, selectorFamily } from 'recoil';

import { localStorageEffect } from '@media-ui/core/src/state/localStorageEffect';

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
                const assetInClipboardIndex = prevState.findIndex(
                    ({ assetId, assetSourceId }) =>
                        assetId === assetIdentity.assetId && assetSourceId === assetIdentity.assetSourceId
                );
                if (assetInClipboardIndex === -1) {
                    return [...prevState, assetIdentity];
                }
                return prevState.splice(assetInClipboardIndex, 1);
            });
        },
});
