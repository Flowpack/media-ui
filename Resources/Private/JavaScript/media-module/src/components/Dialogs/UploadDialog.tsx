import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRecoilState } from 'recoil';

import { Button, Icon } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, MediaUiTheme, useMediaUi, useNotify } from '@media-ui/core/src';
import { useConfigQuery, useUploadFiles } from '@media-ui/core/src/hooks';

import { humanFileSize } from '../../helper';
import { uploadDialogVisibleState } from '../../state';

import { Dialog } from './Dialog';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    uploadArea: {
        padding: theme.spacing.full,
    },
    dropzone: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: theme.spacing.goldenUnit,
        borderWidth: 2,
        borderRadius: 2,
        borderColor: ({ isDragAccept, isDragActive, isDragReject }) => {
            if (isDragAccept) return theme.colors.success;
            if (isDragReject) return theme.colors.error;
            if (isDragActive) return theme.colors.primary;
            return theme.colors.disabled;
        },
        borderStyle: 'dashed',
        backgroundColor: theme.colors.alternatingBackground,
        color: theme.colors.text,
        outline: 'none',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'border .24s ease-in-out',
    },
    fileList: {
        marginTop: theme.spacing.full,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    fileListHeader: {
        flex: '1 1 100%',
        marginBottom: theme.spacing.full,
        fontSize: theme.fontSize,
    },
    thumb: {
        display: 'inline-flex',
        borderRadius: 2,
        border: '1px solid #eaeaea',
        marginBottom: theme.spacing.half,
        marginRight: theme.spacing.half,
        width: 100,
        height: 100,
        padding: theme.spacing.quarter,
        boxSizing: 'border-box',
    },
    thumbInner: {
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& span': {
            marginLeft: theme.spacing.half,
            userSelect: 'none',
        },
    },
    img: {
        position: 'absolute',
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        left: 0,
        top: 0,
        zIndex: -1,
    },
    stateOverlay: {
        position: 'absolute',
        content: '""',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.alternatingBackground,
        opacity: 0.3,
        zIndex: -1,
    },
    loading: {
        borderColor: theme.colors.border,
        '& $thumbInner:after': {
            extend: 'stateOverlay',
        },
    },
    success: {
        borderColor: theme.colors.success,
        '& $thumbInner:after': {
            extend: 'stateOverlay',
            backgroundColor: theme.colors.success,
        },
    },
    error: {
        borderColor: theme.colors.error,
        '& $thumbInner:after': {
            extend: 'stateOverlay',
            backgroundColor: theme.colors.error,
        },
    },
    warning: {
        color: theme.colors.warn,
    },
}));

interface UploadedFile extends File {
    path?: string;
    preview?: string;
}

const UploadDialog: React.FC = () => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const [dialogVisible, setDialogVisible] = useRecoilState(uploadDialogVisibleState);
    const { dummyImage } = useMediaUi();
    const { config } = useConfigQuery();
    const { uploadFiles, uploadState, loading } = useUploadFiles();
    const { refetchAssets } = useMediaUi();
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const uploadPossible = !loading && files.length > 0;

    // TODO: Define accepted mimetypes `{ accept: 'image/jpeg, image/png, video/*'}`
    const { getRootProps, getInputProps, isDragAccept, isDragActive, isDragReject } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length === 0) return;
            setFiles((prev) => {
                const newFiles = (acceptedFiles as UploadedFile[]).map((file) => {
                    if (file.type.indexOf('image') === 0) {
                        file.preview = URL.createObjectURL(file);
                    } else {
                        // TODO: Find better preview visualisation
                        file.preview = dummyImage;
                    }
                    return file;
                });
                return prev.concat(newFiles);
            });
        },
        disabled: loading,
        onDropRejected: () => {
            // TODO: Show rejection reason to user
            Notify.warning(translate('uploadDialog.warning.fileRejected', 'The given file cannot be uploaded.'));
        },
        maxSize: config?.uploadMaxFileSize || 0,
        multiple: true,
        preventDropOnDocument: true,
    });
    const classes = useStyles({ isDragAccept, isDragActive, isDragReject });

    useEffect(() => {
        // Make sure to revoke the data uris to avoid memory leaks
        files.forEach((file) => URL.revokeObjectURL(file.preview));
    }, [files]);

    const handleUpload = useCallback(() => {
        uploadFiles(files)
            .then(() => {
                Notify.ok(translate('uploadDialog.uploadFinished', 'Upload finished'));
                refetchAssets();
            })
            .catch((error) => {
                Notify.error(translate('fileUpload.error', 'Upload failed'), error);
            });
    }, [uploadFiles, Notify, translate, files, refetchAssets]);

    const handleRequestClose = useCallback(() => {
        setFiles([]);
        setDialogVisible(false);
    }, [setFiles, setDialogVisible]);

    return (
        <Dialog
            isOpen={dialogVisible}
            title={translate('uploadDialog.title', 'Upload assets')}
            onRequestClose={handleRequestClose}
            actions={[
                <Button key="cancel" style="neutral" hoverStyle="darken" onClick={handleRequestClose}>
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
                <div {...getRootProps({ className: classes.dropzone })}>
                    <input {...getInputProps()} />
                    <p>
                        {translate(
                            'uploadDialog.dropzone.caption',
                            "Drag 'n' drop some files here, or click to select files"
                        )}
                    </p>
                    {config?.uploadMaxFileSize && (
                        <p>
                            {translate('uploadDialog.maxFileSize', 'Maximum file size is ')}
                            {humanFileSize(config.uploadMaxFileSize)}
                        </p>
                    )}
                </div>
                {loading && <p>Uploading...</p>}
                {files.length > 0 && (
                    <aside className={classes.fileList}>
                        <h4 className={classes.fileListHeader}>
                            {translate('uploadDialog.fileList.header', 'Selected files')}
                        </h4>
                        {files.map((file: UploadedFile) => {
                            // TODO: cleanup and move into component
                            const fileState = uploadState.find((result) => result.filename === file.name);
                            const success = fileState?.success;

                            let stateClassName = '';
                            if (loading) stateClassName = classes.loading;
                            if (success) stateClassName = classes.success;
                            if (fileState && !success) stateClassName = classes.error;

                            // TODO: Output helpful localised messages for results 'EXISTS', 'ADDED', 'ERROR'

                            return (
                                <div
                                    className={[classes.thumb, stateClassName].join(' ')}
                                    key={file.name}
                                    title={file.name}
                                >
                                    <div className={classes.thumbInner}>
                                        <img src={file.preview} alt={file.name} className={classes.img} />
                                        {loading && <Icon icon="spinner" spin={true} />}
                                        {success && <Icon icon="check" />}
                                        {fileState && !fileState.success && <Icon icon="exclamation-circle" />}
                                        {fileState?.result && <span>{fileState.result}</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </aside>
                )}
            </section>
        </Dialog>
    );
};

export default React.memo(UploadDialog);
