import { atom } from 'recoil';

const uploadDialogState = atom({
    key: 'uploadDialogState',
    default: {
        visible: false,
    },
});

export default uploadDialogState;
