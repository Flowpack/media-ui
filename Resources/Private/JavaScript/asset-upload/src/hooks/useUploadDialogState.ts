import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useRecoilState } from 'recoil';
import { uploadPossibleState, uploadDialogState } from '../state';
import { UPLOAD_TYPE, UploadDialogStateWithFiles } from '../state/uploadDialogState';

const useUploadDialogState = (): {
    state: UploadDialogStateWithFiles;
    closeDialog(): void;
    setFiles: Dispatch<SetStateAction<FilesUploadState>>;
    setUploadPossible: Dispatch<SetStateAction<boolean>>;
} => {
    // TODO: Use reducer instead to manage the state of files in their various states -> simplifies code in dialogs
    const [files, setFiles] = useState<FilesUploadState>({
        selected: [],
        finished: [],
        rejected: [],
    });
    const [dialogState, setDialogState] = useRecoilState(uploadDialogState);
    const [uploadPossible, setUploadPossible] = useRecoilState(uploadPossibleState);

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
        setUploadPossible(false);
    }, [files, setFiles, setDialogState, setUploadPossible]);

    return {
        state: {
            ...dialogState,
            files,
            uploadPossible,
        },
        closeDialog: handleClose,
        setFiles,
        setUploadPossible,
    };
};

export default useUploadDialogState;
