import { useMutation } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { selectedTagIdState } from '@media-ui/feature-asset-tags';
import { selectedAssetCollectionIdState } from '@media-ui/feature-asset-collections';

import { UPLOAD_FILES } from '../mutations';

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
