import { atom } from 'recoil';

const metadataEditorVisibleState = atom({
    key: 'metadataEditorVisibleState',
    default: false,
});

export default metadataEditorVisibleState;
