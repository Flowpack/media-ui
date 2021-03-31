import { atom } from 'recoil';

const currentPageState = atom<number>({
    key: 'currentPageState',
    default: 1,
});

export default currentPageState;
