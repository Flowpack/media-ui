import { atom } from 'recoil';

import AssetIdentity from '../interfaces/AssetIdentity';

const selectedAssetIdState = atom<AssetIdentity>({
    key: 'selectedAssetIdState',
    default: null,
});

export default selectedAssetIdState;
