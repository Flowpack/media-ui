import { atom } from 'recoil';

const selectedAssetCollectionIdState = atom<string>({
    key: 'selectedAssetCollectionIdState',
    default: null,
});

export default selectedAssetCollectionIdState;
