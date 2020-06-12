import { useFetch } from './index';
import { useState } from 'react';
import { useIntl, useNotify } from '../core';

interface UploadState {
    [filename: string]: {
        loading: boolean;
        response: {
            success?: boolean;
            result?: string;
        };
    };
}

export default function useAlternativeUploadFiles(endpoint: string, csrfToken: string) {
    const { fetchData } = useFetch(endpoint);
    const { translate } = useIntl();
    const [uploadState, setUploadState] = useState<UploadState>({});
    const Notify = useNotify();

    const loading = Object.keys(uploadState).reduce((carry, upload) => carry || uploadState[upload].loading, false);

    const uploadFiles = async (files: File[]) => {
        const requests = files.map(async file => {
            const formData = new FormData();
            formData.append('__csrfToken', csrfToken);
            formData.append('moduleArguments[file]', file, file.name);

            // Don't repeat successful uploads
            if (uploadState[file.name]?.response.success) {
                return;
            }

            setUploadState(prev => ({
                ...prev,
                [file.name]: {
                    response: null,
                    loading: true
                }
            }));

            return fetchData(formData)
                .then(result => {
                    setUploadState(prev => ({
                        ...prev,
                        [file.name]: {
                            loading: false,
                            response: result
                        }
                    }));
                })
                .catch(error => {
                    setUploadState(prev => ({
                        ...prev,
                        [file.name]: {
                            response: null,
                            loading: false
                        }
                    }));
                    Notify.error(translate('fileUpload.error', 'Upload failed'), error);
                });
        });
        return Promise.all(requests).then(() => uploadState);
    };

    return { uploadFiles, uploadState, loading };
}
