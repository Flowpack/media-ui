import * as React from 'react';
import { useCallback } from 'react';

import { Button } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, MediaUiTheme, useIntl, useMediaUi, useNotify } from '@media-ui/core/src';
import { useUploadFiles } from '@media-ui/core/src/hooks';
import { Dialog } from '@media-ui/core/src/components';

import UploadSection from '../UploadSection';
import PreviewSection from '../PreviewSection';
import { useUploadDialogState } from '../../hooks';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    uploadArea: {
        padding: theme.spacing.full,
    },
}));

const NewAssetDialog: React.FC = () => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const { uploadFiles, uploadState, loading } = useUploadFiles();
    const { state: dialogState, closeDialog, setFiles } = useUploadDialogState();
    const { refetchAssets } = useMediaUi();
    const uploadPossible = !loading && dialogState.files.length > 0;

    const classes = useStyles();

    const handleUpload = useCallback(() => {
        uploadFiles(dialogState.files)
            .then(() => {
                Notify.ok(translate('uploadDialog.uploadFinished', 'Upload finished'));
                refetchAssets();
            })
            .catch((error) => {
                Notify.error(translate('fileUpload.error', 'Upload failed'), error);
            });
    }, [uploadFiles, Notify, translate, dialogState, refetchAssets]);

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
                    disabled={!uploadPossible}
                    onClick={handleUpload}
                >
                    {translate('uploadDialog.upload', 'Upload')}
                </Button>,
            ]}
            style="wide"
        >
            <section className={classes.uploadArea}>
                <UploadSection files={dialogState.files} loading={loading} onSetFiles={setFiles} />
                <PreviewSection files={dialogState.files} loading={loading} uploadState={uploadState} />
            </section>
        </Dialog>
    );
};

export default React.memo(NewAssetDialog);
