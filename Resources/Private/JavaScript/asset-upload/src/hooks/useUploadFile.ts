import { useMutation } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { selectedTagIdState } from '@media-ui/feature-asset-tags';
import { selectedAssetCollectionIdState } from '@media-ui/feature-asset-collections';

import { UPLOAD_FILE } from '../mutations';
import { FileUploadResult } from '../../typings';

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
            refetchQueries: ['ASSET_COLLECTIONS'],
        });

    return { uploadFile, uploadState: data?.uploadFile || {}, error, loading };
}
