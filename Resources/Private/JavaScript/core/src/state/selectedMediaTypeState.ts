import { atom } from 'recoil';

export type AssetMediaType = 'image' | 'video' | 'audio' | 'document' | 'all';

const selectedMediaTypeState = atom<AssetMediaType>({
    key: 'selectedMediaTypeState',
    default: 'all',
});

export default selectedMediaTypeState;
