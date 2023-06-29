import { atom } from 'recoil';

const selectedAssetForPreviewState = atom<AssetIdentity>({
    key: 'selectedAssetForPreviewState',
    default: null,
});

export default selectedAssetForPreviewState;
