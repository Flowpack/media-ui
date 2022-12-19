import { useMutation } from '@apollo/client';

import { REPLACE_ASSET } from '../mutations';
import { FileUploadResult, UploadedFile } from '../interfaces';

export interface AssetReplacementOptions {
    generateRedirects: boolean;
    keepOriginalFilename: boolean;
}

interface ReplaceAssetProps {
    asset: Asset;
    file: UploadedFile;
    options: AssetReplacementOptions;
}

export default function useReplaceAsset() {
    const [action, { error, data, loading }] = useMutation<{ replaceAsset: FileUploadResult }>(REPLACE_ASSET);

    const replaceAsset = ({ asset, file, options }: ReplaceAssetProps) => {
        const uploadProperties = {
            filename: file.name,
            copyrightNotice: file?.copyrightNotice,
            title: file?.title,
            caption: file?.caption,
        };

        return action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id,
                file,
                options,
                uploadProperties,
            },
        });
    };

    return { replaceAsset, uploadState: data?.replaceAsset || null, error, loading };
}
