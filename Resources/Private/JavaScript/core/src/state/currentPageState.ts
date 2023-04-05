import { atom } from 'recoil';

import { localStorageEffect } from './localStorageEffect';

export const currentPageState = atom<number>({
    key: 'currentPageState',
    default: 1,
    effects: [localStorageEffect('currentPageState', (v) => (isNaN(v) ? 1 : v))],
});
