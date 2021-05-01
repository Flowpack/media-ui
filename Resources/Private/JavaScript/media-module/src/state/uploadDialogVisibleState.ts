import { atom } from 'recoil';

const uploadDialogVisibleState = atom({
    key: 'uploadDialogState',
    default: false,
});

export default uploadDialogVisibleState;
