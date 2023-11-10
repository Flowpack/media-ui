import { atom } from 'recoil';
import { FilesUploadState } from '../../typings';

export enum UPLOAD_TYPE {
    new = 'new',
    update = 'update',
}

export interface UploadDialogState {
    visible: boolean;
    uploadType: UPLOAD_TYPE;
}

export const uploadDialogState = atom<UploadDialogState>({
    key: 'uploadDialogState',
    default: {
        visible: false,
        uploadType: UPLOAD_TYPE.new,
    },
});

export interface UploadDialogStateWithFiles extends UploadDialogState {
    files: FilesUploadState;
    uploadPossible: boolean;
}
