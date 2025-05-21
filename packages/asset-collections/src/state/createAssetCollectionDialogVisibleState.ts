import { atom } from 'recoil';

export const createAssetCollectionDialogVisibleState = atom<boolean>({
    key: 'createAssetCollectionDialogState',
    default: false,
});
