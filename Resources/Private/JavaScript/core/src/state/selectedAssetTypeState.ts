import { atom, selector } from 'recoil';

import { localStorageEffect } from './localStorageEffect';
import { constraintsState } from './constraintsState';

const selectedAssetTypeInternalState = atom<AssetType | ''>({
    key: 'selectedAssetTypeInternalState',
    default: '',
    effects: [localStorageEffect('selectedAssetTypeState')],
});

export const selectedAssetTypeState = selector<AssetType | ''>({
    key: 'selectedAssetTypeState',
    get: ({ get }) => {
        const assetType = get(selectedAssetTypeInternalState);
        const constraints = get(constraintsState);
        return constraints?.assetType ? constraints.assetType : assetType;
    },
    set: ({ get, set }, assetType) => {
        const constraints = get(constraintsState);
        if (constraints && constraints.assetType !== assetType) {
            assetType = constraints.assetType;
        }
        set(selectedAssetTypeInternalState, assetType);
    },
});
