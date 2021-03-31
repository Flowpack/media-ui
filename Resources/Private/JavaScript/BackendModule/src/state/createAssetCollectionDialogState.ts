import { atom } from 'recoil';

const createAssetCollectionDialogState = atom({
    key: 'createAssetCollectionDialogState',
    default: {
        visible: false,
        title: '',
    },
});

export default createAssetCollectionDialogState;
