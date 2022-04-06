import { useMutation } from '@apollo/client';

import { REPLACE_ASSET } from '../mutations';
import { Asset, FileUploadResult } from '../interfaces';

export interface AssetReplacementOptions {
    generateRedirects: boolean;
    keepOriginalFilename: boolean;
}

interface ReplaceAssetProps {
    asset: Asset;
    file: File;
    options: AssetReplacementOptions;
}

export default function useReplaceAsset() {
    const [action, { error, data, loading }] = useMutation<{ replaceAsset: FileUploadResult }>(REPLACE_ASSET);

    const replaceAsset = ({ asset, file, options }: ReplaceAssetProps) => {
        return action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id,
                file,
                options,
            },
        });
    };

    return { replaceAsset, uploadState: data?.replaceAsset || null, error, loading };
}
