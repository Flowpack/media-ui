import { atom } from 'recoil';

const uploadPossibleState = atom<boolean>({
    key: 'uploadPossibleState',
    default: false,
});

export default uploadPossibleState;
