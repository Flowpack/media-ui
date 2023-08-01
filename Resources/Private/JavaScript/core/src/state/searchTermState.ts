import { atom } from 'recoil';

import { SearchTerm } from '../domain/SearchTerm';
import { localStorageEffect } from './localStorageEffect';

export const searchTermState = atom<SearchTerm>({
    key: 'searchTermState',
    default: SearchTerm.fromString(''),
    effects: [
        localStorageEffect('searchTermState', ({ value }) => {
            const searchTerm = SearchTerm.fromString(value);
            return searchTerm.empty() ? undefined : searchTerm;
        }),
    ],
});
