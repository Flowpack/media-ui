import { atom } from 'recoil';

const searchTermState = atom<string>({
    key: 'searchTermState',
    default: ''
});

export default searchTermState;
