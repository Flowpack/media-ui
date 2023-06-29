import { atom } from 'recoil';

import { localStorageEffect } from './localStorageEffect';

export const selectedMediaTypeState = atom<MediaType | ''>({
    key: 'selectedMediaTypeState',
    default: '',
    effects: [localStorageEffect('selectedMediaTypeState')],
});
