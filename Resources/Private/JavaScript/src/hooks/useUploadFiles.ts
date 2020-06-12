import { useMutation } from '@apollo/react-hooks';

import { UPLOAD_FILES } from '../queries';
import { Asset } from '../interfaces';

interface UploadFilesProps {
    files: File[];
}

interface UploadFilesVariables {
    files: File[];
}

export default function useUploadFiles() {
    const [action, { error, data, loading }] = useMutation<{ uploadFiles: Asset }, UploadFilesVariables>(UPLOAD_FILES);

    const uploadFiles = ({ files }: UploadFilesProps) =>
        action({
            variables: {
                files
            }
        });

    return { uploadFiles, data, error, loading };
}
