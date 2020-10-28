import { atom } from 'recoil';

const createTagDialogState = atom({
    key: 'createTagDialogState',
    default: {
        visible: false,
        title: ''
    }
});

export default createTagDialogState;
