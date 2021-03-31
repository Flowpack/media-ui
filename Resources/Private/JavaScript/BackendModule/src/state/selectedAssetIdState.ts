import { atom } from 'recoil';

const selectedAssetIdState = atom<string>({
    key: 'selectedAssetIdState',
    default: null,
});

export default selectedAssetIdState;
