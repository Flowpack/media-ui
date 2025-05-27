import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useRecoilState } from 'recoil';

import { uploadDialogState } from '../state';
import type { UploadDialogState } from '../state/uploadDialogState';
import { UPLOAD_TYPE } from '../state/uploadDialogState';

interface UploadDialogStateWithFiles extends UploadDialogState {
    files: FilesUploadState;
}

const useUploadDialogState = (): {
    state: UploadDialogStateWithFiles;
    closeDialog(): void;
    setFiles: Dispatch<SetStateAction<FilesUploadState>>;
} => {
    // TODO: Use reducer instead to manage the state of files in their various states -> simplifies code in dialogs
    const [files, setFiles] = useState<FilesUploadState>({
        selected: [],
        finished: [],
        rejected: [],
    });
    const [dialogState, setDialogState] = useRecoilState(uploadDialogState);

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
