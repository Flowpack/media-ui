import { UploadedFile } from './UploadedFile';
export interface FilesUploadState {
    selected: UploadedFile[];
    finished: UploadedFile[];
    rejected: UploadedFile[];
}
