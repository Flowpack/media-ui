import { useMutation } from '@apollo/react-hooks';

import { UPLOAD_FILE } from '../queries';
import { Asset } from '../interfaces';

interface UploadFileProps {
    file: File;
}

interface UploadFileVariables {
    file: File;
}

export default function useUploadFile() {
    const [action, { error, data, loading }] = useMutation<{ uploadFile: Asset }, UploadFileVariables>(UPLOAD_FILE);

    const uploadFile = ({ file }: UploadFileProps) =>
        action({
            variables: {
                file
            }
        });

    return { uploadFile, data, error, loading };
}
