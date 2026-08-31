import { atom } from 'recoil';

const createTagDialogState = atom<{
    visible: boolean;
    label: string;
    validation: { valid: boolean; errors: string[] };
}>({
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
