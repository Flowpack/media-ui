import { atom } from 'recoil';

const initialLoadCompleteState = atom<boolean>({
    key: 'initialLoadComplete',
    default: false,
});

export default initialLoadCompleteState;
