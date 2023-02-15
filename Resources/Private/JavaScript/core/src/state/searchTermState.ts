import { atom } from 'recoil';

import { SearchTerm } from '../domain/SearchTerm';

const searchTermState = atom<SearchTerm>({
    key: 'searchTermState',
    default:
        typeof window === 'undefined' ? SearchTerm.fromString('') : SearchTerm.fromUrl(new URL(window.location.href)),
});

export default searchTermState;
