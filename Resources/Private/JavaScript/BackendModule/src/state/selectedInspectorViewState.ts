import { atom } from 'recoil';

const selectedInspectorViewState = atom<null | 'asset' | 'assetCollection' | 'tag'>({
    key: 'selectedInspectorViewState',
    default: null,
});

export default selectedInspectorViewState;
