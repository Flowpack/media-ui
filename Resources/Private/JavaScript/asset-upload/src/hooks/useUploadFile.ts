import { useMutation } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { selectedAssetCollectionIdState, selectedTagIdState } from '@media-ui/core/src/state';

import { UPLOAD_FILE } from '../mutations';
import { FileUploadResult } from '../interfaces';

export default function useUploadFile() {
    const [action, { error, data, loading }] = useMutation<{ uploadFile: FileUploadResult }>(UPLOAD_FILE);
    const tagId = useRecoilValue(selectedTagIdState);
    const assetCollectionId = useRecoilValue(selectedAssetCollectionIdState);

    const uploadFile = (file: File) =>
        action({
            variables: {
                file,
                tagId,
                assetCollectionId,
            },
        });

    return { uploadFile, uploadState: data?.uploadFile || {}, error, loading };
}
