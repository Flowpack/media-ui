import * as React from 'react';
import { useDropzone } from 'react-dropzone';

import { useIntl, createUseMediaUiStyles, MediaUiTheme, useMediaUi, useNotify } from '@media-ui/core';
import { useConfigQuery } from '@media-ui/core/src/hooks';
import { humanFileSize } from '@media-ui/core/src/helper';
import { UploadedFile } from '../interfaces';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
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
        '& p': {
            margin: 0,
            lineHeight: 1.6,
        },
    },
}));

interface UploadSectionProps {
    files: UploadedFile[];
    loading: boolean;
    onSetFiles: (files: UploadedFile[]) => void;
    maxFiles?: number;
    acceptedFileTypes?: string | string[];
}

const UploadSection: React.FC<UploadSectionProps> = ({
    acceptedFileTypes,
    files,
    loading,
    maxFiles,
    onSetFiles,
}: UploadSectionProps) => {
    const { translate } = useIntl();
    const Notify = useNotify();
    const { dummyImage } = useMediaUi();
    const { config } = useConfigQuery();
    const maxFilesToUpload = maxFiles
        ? Math.min(maxFiles, config?.uploadMaxFileUploadLimit)
        : config?.uploadMaxFileUploadLimit || 1;

    const { getRootProps, getInputProps, isDragAccept, isDragActive, isDragReject } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length === 0) return;
            const spotsLeft = maxFilesToUpload - files.length;

            if (acceptedFiles.length > spotsLeft) {
                Notify.error(
                    translate(
                        'uploadDialog.warning.maxFiles',
                        `You can only upload a maximum of {limit} files. {rejected} File(s) rejected`,
                        {
                            limit: maxFilesToUpload,
                            rejected: acceptedFiles.length - spotsLeft,
                        }
                    )
                );
            }

            if (spotsLeft === 0) {
                return;
            }

            const newAcceptedFiles =
                acceptedFiles.length < spotsLeft ? acceptedFiles : acceptedFiles.slice(0, spotsLeft);

            const newFiles = (newAcceptedFiles as UploadedFile[]).map((file) => {
                // Generate a unique id for the file to prevent errors with duplicate file names
                file.id = `${file.name}-${file.size}-${file.lastModified}`;
                if (file.type.indexOf('image') === 0) {
                    file.preview = URL.createObjectURL(file);
                } else {
                    // TODO: Find better preview visualisation
                    file.preview = dummyImage;
                }
                return file;
            });
            onSetFiles(files.concat(newFiles));
        },
        disabled: loading,
        onDropRejected: (rejections) => {
            rejections.forEach((rejection) => {
                Notify.warning(
                    translate('uploadDialog.warning.fileRejected', `The given file cannot be uploaded.`),
                    rejection.errors.reduce((acc, error) => `${acc} ${error.message}`, '')
                );
            });
        },
        maxSize: config?.uploadMaxFileSize || 0,
        maxFiles: maxFilesToUpload,
        multiple: maxFilesToUpload > 1,
        preventDropOnDocument: true,
        accept: acceptedFileTypes,
    });
    const classes = useStyles({ isDragAccept, isDragActive, isDragReject });

    return (
        <section>
            <div {...getRootProps({ className: classes.dropzone })}>
                <input {...getInputProps()} />
                <p>
                    {translate(
                        'uploadDialog.dropzone.caption',
                        "Drag 'n' drop some files here, or click to select files"
                    )}
                </p>
                {config?.uploadMaxFileSize > 0 && (
                    <p>
                        {translate(
                            'uploadDialog.maxFileSize',
                            'Maximum file size is {size} and file limit is {limit}',
                            {
                                size: humanFileSize(config.uploadMaxFileSize),
                                limit: maxFilesToUpload,
                            }
                        )}
                    </p>
                )}
            </div>
            {loading && <p>{translate('uploadDialog.label.uploading', 'Uploading…')}</p>}
        </section>
    );
};

export default React.memo(UploadSection);
