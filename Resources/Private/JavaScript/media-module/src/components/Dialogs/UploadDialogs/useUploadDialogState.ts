import { useCallback, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { uploadDialogVisibleState } from '../../../state';
import { UploadDialogVisibleState, UPLOAD_TYPE } from '../../../state/uploadDialogVisibleState';
import { UploadedFile } from './Presentationals/UploadSection';

interface UploadDialogState extends UploadDialogVisibleState {
    files: UploadedFile[];
}
const useUploadDialogState = (): {
    state: UploadDialogState;
    closeDialog(): void;
    setFiles(fles: UploadedFile[]): void;
} => {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [dialogState, setDialogState] = useRecoilState(uploadDialogVisibleState);

    useEffect(() => {
        // Make sure to revoke the data uris to avoid memory leaks
        files.forEach((file) => URL.revokeObjectURL(file.preview));
    }, [files]);

    const handleClose = useCallback(() => {
        setFiles([]);
        setDialogState({ uploadType: UPLOAD_TYPE.new, visible: false });
    }, [setFiles, setDialogState]);

    return {
        state: {
            ...dialogState,
            files,
        },
        closeDialog: handleClose,
        setFiles,
    };
};

export default useUploadDialogState;
