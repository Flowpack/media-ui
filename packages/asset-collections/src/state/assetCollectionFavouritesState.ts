import { atom, selectorFamily } from 'recoil';

import { localStorageEffect } from '@media-ui/core/src/state';

export const assetCollectionFavouritesState = atom<Record<string, boolean>>({
    key: 'AssetCollectionFavouritesState',
    default: {},
    effects: [localStorageEffect('AssetCollectionFavouritesState')],
});

export const assetCollectionFavouriteState = selectorFamily<boolean, string>({
    key: 'AssetCollectionFavouriteState',
    get:
        (assetCollectionId) =>
        ({ get }) =>
            !!get(assetCollectionFavouritesState)[assetCollectionId],
    set:
        (assetCollectionId) =>
        ({ set }, newValue: boolean) =>
            set(assetCollectionFavouritesState, (prevState) => {
                const newState = {
                    ...prevState,
                    [assetCollectionId]: newValue,
                };
                if (newState[assetCollectionId] === false) {
                    delete newState[assetCollectionId];
                }
                return newState;
            }),
});
