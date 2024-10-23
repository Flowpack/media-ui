import { atom } from 'recoil';

const createTagDialogState = atom({
    key: 'createTagDialogState',
    default: {
        visible: false,
        label: '',
        tags: [],
        validation: {
            valid: false,
            errors: [],
        },
    },
});

export default createTagDialogState;
