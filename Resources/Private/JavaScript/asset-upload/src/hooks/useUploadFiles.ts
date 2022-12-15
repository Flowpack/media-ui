import { useMutation } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { selectedTagIdState } from '@media-ui/feature-asset-tags';
import { selectedAssetCollectionIdState } from '@media-ui/feature-asset-collections';

import { UPLOAD_FILES } from '../mutations';
import { FileUploadResult } from '../interfaces';
import UploadedFile from '../interfaces/UploadedFile';

export default function useUploadFiles() {
    const [action, { error, data, loading }] = useMutation<{ uploadFiles: FileUploadResult[] }>(UPLOAD_FILES);
    const tagId = useRecoilValue(selectedTagIdState);
    const assetCollectionId = useRecoilValue(selectedAssetCollectionIdState);

    const uploadFiles = (files: UploadedFile[]) => {
        const uploadProperties = [];
        files.forEach((file) => {
            uploadProperties.push({
                filename: file.name,
                copyrightNotice: file?.copyrightNotice,
                title: file?.title,
                caption: file?.caption,
            });
        });

        return action({
            variables: {
                files,
                tagId,
                assetCollectionId,
                uploadProperties,
            },
            refetchQueries: ['ASSET_COLLECTIONS'],
        });
    };

    return { uploadFiles, uploadState: data?.uploadFiles || [], error, loading };
}
