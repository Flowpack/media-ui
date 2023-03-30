import { atom } from 'recoil';

const selectedAssetIdState = atom<AssetIdentity>({
    key: 'selectedAssetIdState',
    default: null,
});

export default selectedAssetIdState;
