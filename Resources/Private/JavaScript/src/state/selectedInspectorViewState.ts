import { atom } from 'recoil';

const selectedInspectorViewState = atom<null | 'asset' | 'assetCollection'>({
    key: 'selectedInspectorViewState',
    default: null
});

export default selectedInspectorViewState;
