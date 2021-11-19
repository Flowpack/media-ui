import * as tus from 'tus-js-client';
import { UploadOptions } from 'tus-js-client';
import { useIntl, useMediaUi, useNotify } from '@media-ui/core/src';
import { useConfigQuery } from '@media-ui/core/src/hooks';
import { useState } from 'react';

export interface FileUploadState {
    fileName: string;
    uploadPercentage: string;
}

export default function useUploadFiles() {
    const { config } = useConfigQuery();
    const { refetchAssets } = useMediaUi();
    const Notify = useNotify();
    const { translate } = useIntl();
    const [uploadState, setUploadState] = useState([] as FileUploadState[]);
    const [loading, setLoading] = useState(false);
    let numberOfFiles = 0;

    const options: UploadOptions = {
        endpoint: `${window.location.protocol}//${window.location.host}/neos/management/mediaui/upload`,
        chunkSize: config.maximumUploadChunkSize,
        onError: (error) => {
            numberOfFiles--;
            if (numberOfFiles === 0) {
                setLoading(false);
            }
            Notify.error(translate('fileUpload.error', 'Upload failed'), error.message);
        },
        onSuccess: () => {
            numberOfFiles--;
            if (numberOfFiles === 0) {
                Notify.ok(translate('uploadDialog.uploadFinished', 'Upload finished'));
                setLoading(false);
            }
            refetchAssets();
        },
        removeFingerprintOnSuccess: true,
    };

    const uploadFiles = (files: File[]) => {
        numberOfFiles = files.length;
        files.forEach((file) => {
            options.metadata = {
                filename: file.name,
                filetype: file.type,
            };

            options.onProgress = (bytesUploaded, bytesTotal) => {
                setLoading(true);
                const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(0);
                setUploadState((prevState) => {
                    let newState: FileUploadState[] = [];
                    if (prevState.length > 0) {
                        newState = [...prevState];
                        if (newState.find((uploadState) => uploadState.fileName === file.name)) {
                            newState.find(
                                (uploadState) => uploadState.fileName === file.name
                            ).uploadPercentage = percentage;
                        } else {
                            newState.push({
                                fileName: file.name,
                                uploadPercentage: percentage,
                            });
                        }
                    } else {
                        newState.push({
                            fileName: file.name,
                            uploadPercentage: percentage,
                        });
                    }
                    return newState;
                });
            };

            const upload = new tus.Upload(file, options);

            upload.findPreviousUploads().then((previousUploads) => {
                if (previousUploads.length) {
                    previousUploads.forEach((previousUpload) => {
                        upload.resumeFromPreviousUpload(previousUpload);
                    });
                }
                upload.start();
            });
        });
    };

    return { uploadFiles, uploadState, loading };
}
