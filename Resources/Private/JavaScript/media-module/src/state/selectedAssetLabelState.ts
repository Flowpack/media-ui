import { atom } from 'recoil';

const selectedAssetLabelState = atom({
    key: 'SelectedAssetLabelState',
    default: '',
});

export default selectedAssetLabelState;
