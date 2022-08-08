import UploadedFile from './UploadedFile';

export default interface FilesUploadState {
    selected: UploadedFile[];
    finished: UploadedFile[];
    rejected: UploadedFile[];
}
