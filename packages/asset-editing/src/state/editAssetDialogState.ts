import { atom } from 'recoil';

const editAssetDialogState = atom({
    key: 'editDialogState',
    default: false,
});

export default editAssetDialogState;
