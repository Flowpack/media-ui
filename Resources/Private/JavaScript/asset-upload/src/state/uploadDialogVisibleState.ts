import { atom } from 'recoil';

export enum UPLOAD_TYPE {
    new = 'new',
    update = 'update',
}

export interface UploadDialogVisibleState {
    visible: boolean;
    uploadType: UPLOAD_TYPE;
}
const uploadDialogVisibleState = atom<UploadDialogVisibleState>({
    key: 'uploadDialogState',
    default: {
        visible: false,
        uploadType: UPLOAD_TYPE.new,
    },
});

export default uploadDialogVisibleState;
