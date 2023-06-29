import { atom } from 'recoil';

export const initialLoadCompleteState = atom<boolean>({
    key: 'InitialLoadCompleteState',
    default: false,
});
