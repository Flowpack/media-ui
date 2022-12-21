import * as React from 'react';

import { Button } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, MediaUiTheme, useIntl, useNotify } from '@media-ui/core/src';
import { useUploadDialogState, useUploadFiles } from '@media-ui/feature-asset-upload/src/hooks';
import { useCallback } from 'react';
import { UploadedFile } from '@media-ui/feature-asset-upload/src/interfaces';
import { PreviewSection, UploadSection } from '@media-ui/feature-asset-upload/src/components';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    uploadArea: {
        padding: theme.spacing.full,
    },
    controls: {
        marginTop: '2rem',
        display: 'flex',
        justifyContent: 'flex-end',
    },
}));

const NewAssetUpload = (props: { onComplete: (result: { object: { __identity: string } }) => void }) => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const { uploadFiles, uploadState, loading } = useUploadFiles();
    const { state: dialogState, setFiles, setUploadPossible } = useUploadDialogState();
    const classes = useStyles();
    const onComplete = props.onComplete;

    const handleUpload = useCallback(() => {
        uploadFiles(dialogState.files.selected)
            .then(({ data: { uploadFiles } }) => {
                if (!uploadFiles[0].success) {
                    Notify.warning(
                        translate('uploadDialog.uploadFinishedWithErrors', 'Some files could not be uploaded')
                    );
                } else {
                    Notify.ok(translate('uploadDialog.uploadFinished', 'Upload finished'));
                    onComplete({ object: { __identity: uploadFiles[0].assetId } });
                }
            })
            .catch((error) => {
                Notify.error(translate('fileUpload.error', 'Upload failed'), error);
            });
    }, [uploadFiles, dialogState.files.selected, Notify, translate, onComplete]);

    const handleSetFiles = useCallback(
        (files: UploadedFile[]) => {
            setFiles((prev) => {
                return { ...prev, selected: files };
            });
        },
        [setFiles]
    );

    return (
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
