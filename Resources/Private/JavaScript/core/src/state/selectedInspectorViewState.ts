import { atom } from 'recoil';

const selectedInspectorViewState = atom<null | 'asset' | 'assetCollection' | 'tag' | 'folder'>({
    key: 'selectedInspectorViewState',
    default: null,
});

export default selectedInspectorViewState;
