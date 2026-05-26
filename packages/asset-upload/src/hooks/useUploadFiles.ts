import { useMutation } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { selectedTagIdState } from '@media-ui/feature-asset-tags';
import { selectedAssetCollectionIdState } from '@media-ui/feature-asset-collections';
import { selectedAssetSourceIdState } from '@media-ui/feature-asset-sources';

import { UPLOAD_FILES } from '../mutations';

export default function useUploadFiles() {
    const [action, { error, data, loading }] = useMutation<{ uploadFiles: FileUploadResult[] }>(UPLOAD_FILES);
    const assetSourceId = useRecoilValue(selectedAssetSourceIdState);
    const tagId = useRecoilValue(selectedTagIdState(assetSourceId));
    const assetCollectionId = useRecoilValue(selectedAssetCollectionIdState(assetSourceId));

    const uploadFiles = (files: File[]) =>
        action({
            variables: {
                files,
                tagId,
                assetCollectionId,
            },
            refetchQueries: ['ASSET_COLLECTIONS'],
        });

    return { uploadFiles, uploadState: data?.uploadFiles || [], error, loading };
}
