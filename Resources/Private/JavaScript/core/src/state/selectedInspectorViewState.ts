import { atom } from 'recoil';

export const selectedInspectorViewState = atom<null | 'asset' | 'assetCollection' | 'tag' | 'folder'>({
    key: 'selectedInspectorViewState',
    default: null,
});
