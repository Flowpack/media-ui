import { atom } from 'recoil';

const createTagDialogState = atom({
    key: 'createTagDialogState',
    default: {
        visible: false,
        label: ''
    }
});

export default createTagDialogState;
