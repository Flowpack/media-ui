import { atom } from 'recoil';

const loadingState = atom<boolean>({
    key: 'loadingState',
    default: false
});

export default loadingState;
