import { atom } from 'recoil';

export const errorState = atom<boolean>({
    key: 'errorState',
    default: false,
});
