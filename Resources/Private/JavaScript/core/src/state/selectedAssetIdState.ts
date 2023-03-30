import { atom } from 'recoil';

export const selectedAssetIdState = atom<AssetIdentity>({
    key: 'selectedAssetIdState',
    default: null,
});
