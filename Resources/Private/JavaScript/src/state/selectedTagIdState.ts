import { atom } from 'recoil';

const selectedTagIdState = atom<string>({
    key: 'selectedTagIdState',
    default: null
});

export default selectedTagIdState;
