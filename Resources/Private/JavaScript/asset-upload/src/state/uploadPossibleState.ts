import { atom } from 'recoil';

export const uploadPossibleState = atom<boolean>({
    key: 'uploadPossibleState',
    default: false,
});
