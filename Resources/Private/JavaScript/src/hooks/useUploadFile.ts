import { useMutation } from '@apollo/react-hooks';

import { UPLOAD_FILE } from '../queries';
import { FileUploadResult } from '../interfaces';

export default function useUploadFile() {
    const [action, { error, data, loading }] = useMutation<{ uploadFile: FileUploadResult }>(UPLOAD_FILE);

    const uploadFile = (file: File) =>
        action({
            variables: {
                file
            }
        });

    return { uploadFile, uploadState: data?.uploadFile || {}, error, loading };
}
