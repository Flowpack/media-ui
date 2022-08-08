import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useRecoilState } from 'recoil';

import { uploadDialogVisibleState } from '../state';
import { UploadDialogVisibleState, UPLOAD_TYPE } from '../state/uploadDialogVisibleState';
import { FilesUploadState } from '../interfaces';

interface UploadDialogState extends UploadDialogVisibleState {
    files: FilesUploadState;
}

const useUploadDialogState = (): {
    state: UploadDialogState;
    closeDialog(): void;
    setFiles: Dispatch<SetStateAction<FilesUploadState>>;
} => {
    // TODO: Use reducer instead to manage the state of files in their various states -> simplifies code in dialogs
    const [files, setFiles] = useState<FilesUploadState>({
        selected: [],
        finished: [],
        rejected: [],
    });
    const [dialogState, setDialogState] = useRecoilState(uploadDialogVisibleState);

    const handleClose = useCallback(() => {
        // Make sure to revoke the data uris to avoid memory leaks
        files.selected.forEach((file) => URL.revokeObjectURL(file.preview));
        files.finished.forEach((file) => URL.revokeObjectURL(file.preview));
        files.rejected.forEach((file) => URL.revokeObjectURL(file.preview));
        setFiles({
            selected: [],
            finished: [],
            rejected: [],
        });
        setDialogState({ uploadType: UPLOAD_TYPE.new, visible: false });
    }, [files, setFiles, setDialogState]);

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
