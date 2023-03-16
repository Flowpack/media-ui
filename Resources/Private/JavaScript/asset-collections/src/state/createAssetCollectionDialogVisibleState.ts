import { atom } from 'recoil';

const createAssetCollectionDialogVisibleState = atom<boolean>({
    key: 'createAssetCollectionDialogState',
    default: false,
});

export default createAssetCollectionDialogVisibleState;
