import { atom } from 'recoil';

export const currentPageState = atom<number>({
    key: 'currentPageState',
    default: 1,
});
