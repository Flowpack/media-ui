import { atom } from 'recoil';

const selectedMediaTypeState = atom<AssetType>({
    key: 'selectedMediaTypeState',
    default: 'all',
});

export default selectedMediaTypeState;
