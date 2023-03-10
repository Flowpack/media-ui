import { atom } from 'recoil';

const selectedAssetCollectionIdState = atom<string | null>({
    key: 'selectedAssetCollectionIdState',
    default: null,
});

export default selectedAssetCollectionIdState;
