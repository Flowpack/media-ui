import { useMutation } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { selectedTagIdState } from '@media-ui/feature-asset-tags';
import { selectedAssetCollectionIdState } from '@media-ui/feature-asset-collections';
import { selectedAssetSourceState } from '@media-ui/feature-asset-sources';

import { UPLOAD_FILE } from '../mutations';

export default function useUploadFile() {
    const [action, { error, data, loading }] = useMutation<{ uploadFile: FileUploadResult }>(UPLOAD_FILE);
    const assetSourceId = useRecoilValue(selectedAssetSourceState);
    const tagId = useRecoilValue(selectedTagIdState(assetSourceId));
    const assetCollectionId = useRecoilValue(selectedAssetCollectionIdState(assetSourceId));

    const uploadFile = (file: File) =>
        action({
            variables: {
                file,
                tagId,
                assetCollectionId,
            },
            refetchQueries: ['ASSET_COLLECTIONS'],
        });

    return { uploadFile, uploadState: data?.uploadFile || {}, error, loading };
}
