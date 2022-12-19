import { atom } from 'recoil';

const selectedAssetCaptionState = atom({
    key: 'SelectedAssetCaptionState',
    default: '',
});

export default selectedAssetCaptionState;
