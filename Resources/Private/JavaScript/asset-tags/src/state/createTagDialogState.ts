import { atom } from 'recoil';

const createTagDialogState = atom({
    key: 'createTagDialogState',
    default: {
        visible: false,
        label: '',
        validation: {
            valid: false,
            errors: [],
        },
    },
});

export default createTagDialogState;
