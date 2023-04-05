import { atom, selectorFamily } from 'recoil';

import { localStorageEffect } from '@media-ui/core/src/state';

export const assetCollectionTreeCollapsedState = atom<Record<string, boolean>>({
    key: 'AssetCollectionTreeState',
    default: {},
    effects: [localStorageEffect('AssetCollectionTreeState')],
});

export const assetCollectionTreeCollapsedItemState = selectorFamily<boolean, string>({
    key: 'AssetCollectionTreeCollapsedProxyState',
    get:
        (assetCollectionId) =>
        ({ get }) =>
            get(assetCollectionTreeCollapsedState)[assetCollectionId] ?? true,
    set:
        (assetCollectionId) =>
        ({ set }, newValue: boolean) =>
            set(assetCollectionTreeCollapsedState, (prevState) => {
                const newState = {
                    ...prevState,
                    [assetCollectionId]: newValue,
                };
                if (newState[assetCollectionId] === true) {
                    delete newState[assetCollectionId];
                }
                return newState;
            }),
});
