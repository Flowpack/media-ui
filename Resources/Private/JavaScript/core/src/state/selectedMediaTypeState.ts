import { atom } from 'recoil';

export type AssetMediaType = 'image' | 'video' | 'audio' | 'document' | 'all';

export const selectedMediaTypeState = atom<AssetMediaType>({
    key: 'selectedMediaTypeState',
    default: 'all',
});
