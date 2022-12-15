import React from 'react';

import { useIntl } from '@media-ui/core';

import FilePreview from './FilePreview';
import { UploadDialogState } from '../hooks/useUploadDialogState';
import { SetStateAction, Dispatch } from 'react';
import { SetterOrUpdater } from 'recoil';

import classes from './PreviewSection.module.css';

interface PreviewSectionProps {
    files: FilesUploadState;
    loading: boolean;
    uploadState: FileUploadResult[];
    dialogState: UploadDialogState;
    setFiles: Dispatch<SetStateAction<FilesUploadState>>;
    setUploadPossible: SetterOrUpdater<boolean>;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({
    files,
    loading,
    uploadState,
    dialogState,
    setFiles,
    setUploadPossible,
}: PreviewSectionProps) => {
    const { translate } = useIntl();

    // FIXME: Mapping the uploadState to the files name is not the best solution as the same filename might be used multiple times

    return (
        <aside className={classes.fileList}>
            {files.selected.length > 0 && (
                <>
                    <h4 className={classes.fileListHeader}>
                        {translate('uploadDialog.fileList.header', 'Selected files')}
                    </h4>
                    <div className={classes.fileListItems}>
                        {files.selected.map((file) => (
                            <FilePreview
                                file={file}
                                loading={loading}
                                fileState={uploadState.find((result) => result.filename === file.name)}
                                key={file.id}
                                dialogState={dialogState}
                                setFiles={setFiles}
                                setUploadPossible={setUploadPossible}
                            />
                        ))}
                    </div>
                </>
            )}
            {files.rejected.length > 0 && (
                <>
                    <h4 className={classes.fileListHeader}>
                        {translate('uploadDialog.fileList.uploadedHeader', 'Failed uploads')}
                    </h4>
                    <div className={classes.fileListItems}>
                        {files.rejected.map((file) => (
                            <FilePreview
                                file={file}
                                fileState={uploadState.find((result) => result.filename === file.name)}
                                key={file.id}
                                dialogState={dialogState}
                                setFiles={setFiles}
                                setUploadPossible={setUploadPossible}
                            />
                        ))}
                    </div>
                </>
            )}
            {files.finished.length > 0 && (
                <>
                    <h4 className={classes.fileListHeader}>
                        {translate('uploadDialog.fileList.uploadedHeader', 'Successful uploads')}
                    </h4>
                    <div className={classes.fileListItems}>
                        {files.finished.map((file) => (
                            <FilePreview
                                file={file}
                                fileState={uploadState.find((result) => result.filename === file.name)}
                                key={file.id}
                                dialogState={dialogState}
                                setFiles={setFiles}
                                setUploadPossible={setUploadPossible}
                            />
                        ))}
                    </div>
                </>
            )}
        </aside>
    );
};

export default React.memo(PreviewSection);
