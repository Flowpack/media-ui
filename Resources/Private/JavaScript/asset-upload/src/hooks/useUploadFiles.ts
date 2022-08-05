import { useMutation } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { selectedAssetCollectionIdState, selectedTagIdState } from '@media-ui/core/src/state';

import { UPLOAD_FILES } from '../mutations';
import { FileUploadResult } from '../interfaces';

export default function useUploadFiles() {
    const [action, { error, data, loading }] = useMutation<{ uploadFiles: FileUploadResult[] }>(UPLOAD_FILES);
    const tagId = useRecoilValue(selectedTagIdState);
    const assetCollectionId = useRecoilValue(selectedAssetCollectionIdState);

    const uploadFiles = (files: File[]) =>
        action({
            variables: {
                files,
                tagId,
                assetCollectionId,
            },
        });

    return { uploadFiles, uploadState: data?.uploadFiles || [], error, loading };
}
