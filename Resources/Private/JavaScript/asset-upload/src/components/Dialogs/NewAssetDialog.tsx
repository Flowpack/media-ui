import React, { useCallback } from 'react';

import { Button } from '@neos-project/react-ui-components';

import { useIntl, useNotify } from '@media-ui/core';
import { Dialog } from '@media-ui/core/src/components';

import UploadSection from '../UploadSection';
import PreviewSection from '../PreviewSection';
import { useUploadDialogState, useUploadFiles } from '../../hooks';
import { useAssetsQuery } from '@media-ui/core/src/hooks';

import classes from './NewAssetDialog.module.css';

const NewAssetDialog: React.FC = () => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const { uploadFiles, uploadState, loading } = useUploadFiles();
    const { state: dialogState, closeDialog, setFiles, setUploadPossible } = useUploadDialogState();
    const { state: dialogState, closeDialog, setFiles } = useUploadDialogState();
    const { refetch } = useAssetsQuery();

    const handleUpload = useCallback(() => {
        const filesToUpload = dialogState.files.selected.filter((file) => !dialogState.files.finished.includes(file));
        uploadFiles(filesToUpload)
            .then(({ data: { uploadFiles } }) => {
                // FIXME: Mapping the uploadState to the files name is not the best solution as the same filename might be used multiple times
                // Move uploaded or failed files into separate lists
                setFiles((prev) => {
                    return {
                        selected: [],
                        finished: [
                            ...prev.finished,
                            ...prev.selected.filter((file) =>
                                uploadFiles.find((result) => {
                                    return result.success && result.filename === file.name
                                        ? (file.uploadStateResult = result.result)
                                        : false;
                                })
                            ),
                        ],
                        rejected: [
                            ...prev.rejected,
                            ...prev.selected.filter((file) =>
                                uploadFiles.find((result) => {
                                    return !result.success && result.filename === file.name
                                        ? (file.uploadStateResult = result.result)
                                        : false;
                                })
                            ),
                        ],
                    } as FilesUploadState;
                });
                if (uploadFiles.some((result) => !result.success)) {
                    Notify.warning(
                        translate('uploadDialog.uploadFinishedWithErrors', 'Some files could not be uploaded')
                    );
                } else {
                    Notify.ok(translate('uploadDialog.uploadFinished', 'Upload finished'));
                }

                // Refresh list of files if any file was uploaded
                if (uploadFiles.some((result) => result.success)) {
                    void refetch();
                }
                setUploadPossible(false);
            })
            .catch((error) => {
                Notify.error(translate('fileUpload.error', 'Upload failed'), error);
            });
    }, [uploadFiles, dialogState.files.selected, setFiles, Notify, translate, refetch]);

    const handleSetFiles = useCallback(
        (files: UploadedFile[]) => {
            setFiles((prev) => {
                const fileNames = new Set();
                for (const file of prev.finished.concat(prev.rejected)) {
                    fileNames.add(file.name);
                }
                const newSelectedFiles = files.filter((file) => {
                    return fileNames.has(file.name) ? false : fileNames.add(file.name);
                });
                return { ...prev, selected: newSelectedFiles };
            });
        },
        [setFiles]
    );

    return (
        <Dialog
            isOpen={dialogState.visible}
            title={translate('uploadDialog.title', 'Upload assets')}
            onRequestClose={closeDialog}
            actions={[
                <Button key="cancel" style="neutral" hoverStyle="darken" onClick={closeDialog}>
                    {uploadState
                        ? translate('uploadDialog.close', 'Close')
                        : translate('uploadDialog.cancel', 'Cancel')}
                </Button>,
                <Button
                    key="upload"
                    style="success"
                    hoverStyle="success"
                    disabled={!dialogState.uploadPossible}
                    onClick={handleUpload}
                >
                    {translate('uploadDialog.upload', 'Upload')}
                </Button>,
            ]}
            style="wide"
        >
            <section className={classes.uploadArea}>
                <UploadSection files={dialogState.files.selected} loading={loading} onSetFiles={handleSetFiles} />
                <PreviewSection
                    files={dialogState.files}
                    loading={loading}
                    uploadState={uploadState}
                    dialogState={dialogState}
                    setFiles={setFiles}
                    setUploadPossible={setUploadPossible}
                />
            </section>
        </Dialog>
    );
};

export default React.memo(NewAssetDialog);
