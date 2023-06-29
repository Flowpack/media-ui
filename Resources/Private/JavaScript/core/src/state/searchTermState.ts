import { atom } from 'recoil';

import { SearchTerm } from '../domain/SearchTerm';
import { localStorageEffect } from './localStorageEffect';

export const searchTermState = atom<SearchTerm>({
    key: 'searchTermState',
    default:
        typeof window === 'undefined' ? SearchTerm.fromString('') : SearchTerm.fromUrl(new URL(window.location.href)),
    effects: [localStorageEffect('searchTermState', ({ value }) => SearchTerm.fromString(value))],
});
