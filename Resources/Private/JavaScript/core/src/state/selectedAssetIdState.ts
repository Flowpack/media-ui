import { atom } from 'recoil';

import { localStorageEffect } from './localStorageEffect';

export const selectedAssetIdState = atom<AssetIdentity>({
    key: 'selectedAssetIdState',
    default: null,
    effects: [localStorageEffect('selectedAssetIdState')],
});
