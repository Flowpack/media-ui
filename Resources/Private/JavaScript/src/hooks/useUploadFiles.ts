import { useMutation } from '@apollo/react-hooks';

import { UPLOAD_FILES } from '../queries';
import { FileUploadResult } from '../interfaces';

export default function useUploadFiles() {
    const [action, { error, data, loading }] = useMutation<{ uploadFiles: FileUploadResult[] }>(UPLOAD_FILES);

    const uploadFiles = (files: File[]) =>
        action({
            variables: {
                files
            }
        });

    return { uploadFiles, uploadState: data?.uploadFiles || [], error, loading };
}
