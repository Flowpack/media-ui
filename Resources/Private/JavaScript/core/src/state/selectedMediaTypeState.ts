import { atom } from 'recoil';

import { localStorageEffect } from './localStorageEffect';

export const selectedMediaTypeState = atom<AssetMediaType | ''>({
    key: 'selectedMediaTypeState',
    default: '',
    effects: [localStorageEffect('selectedMediaTypeState')],
});
