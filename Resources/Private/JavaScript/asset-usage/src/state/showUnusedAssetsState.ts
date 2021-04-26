import { atom } from 'recoil';

const showUnusedAssetsState = atom({
    key: 'showUnusedAssets',
    default: false,
});

export default showUnusedAssetsState;
