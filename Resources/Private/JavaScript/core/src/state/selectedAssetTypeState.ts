import { atom } from 'recoil';

import { localStorageEffect } from './localStorageEffect';

export const selectedAssetTypeState = atom<AssetType | ''>({
    key: 'selectedAssetTypeState',
    default: '',
    effects: [localStorageEffect('selectedAssetTypeState')],
});
