import * as React from 'react';

import { Button } from '@neos-project/react-ui-components';

import { useIntl, useNotify } from '@media-ui/core/src';
import { useUploadDialogState, useUploadFiles } from '@media-ui/feature-asset-upload/src/hooks';
import { useCallback } from 'react';
import { PreviewSection, UploadSection } from '@media-ui/feature-asset-upload/src/components';
import classes from './NewAssetUpload.module.css';

const NewAssetUpload = (props: { onComplete: (result: { object: { __identity: string } }) => void }) => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const { uploadFiles, uploadState, loading } = useUploadFiles();
    const { state: dialogState, setFiles, setUploadPossible } = useUploadDialogState();
    const onComplete = props.onComplete;

    const handleUpload = useCallback(() => {
        uploadFiles(dialogState.files.selected)
            .then(({ data: { uploadFiles } }) => {
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
                if (!uploadFiles[0].success) {
                    Notify.warning(
                        translate('uploadDialog.uploadFinishedWithErrors', 'Some files could not be uploaded'),
                        translate('uploadDialog.uploadFinishedWithErrors', 'Some files could not be uploaded')
                    );
                } else {
                    Notify.ok(translate('uploadDialog.uploadFinished', 'Upload finished'));
                    onComplete({ object: { __identity: uploadFiles[0].assetId } });
                }
                setUploadPossible(false);
            })
            .catch((error) => {
                Notify.error(translate('fileUpload.error', 'Upload failed'), error);
            });
    }, [uploadFiles, dialogState.files.selected, setFiles, setUploadPossible, Notify, translate, onComplete]);

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
        <section className={classes.uploadArea}>
            <UploadSection
                files={dialogState.files.selected}
                loading={loading}
                onSetFiles={handleSetFiles}
                maxFiles={1}
            />
            <PreviewSection
                files={dialogState.files}
                loading={loading}
                uploadState={uploadState}
                dialogState={dialogState}
                setFiles={setFiles}
                setUploadPossible={setUploadPossible}
            />
            <div className={classes.controls}>
                <Button
                    key="upload"
                    style="success"
                    hoverStyle="success"
                    disabled={!dialogState.uploadPossible}
                    onClick={handleUpload}
                >
                    {translate('uploadDialog.upload', 'Upload')}
                </Button>
            </div>
        </section>
    );
};

export default NewAssetUpload;
