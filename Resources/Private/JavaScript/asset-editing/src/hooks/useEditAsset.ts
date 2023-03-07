import { useMutation } from '@apollo/client';

import { Asset } from '@media-ui/core/src/interfaces';

import EDIT_ASSET from '../mutations/editAsset';

export interface AssetEditOptions {
    generateRedirects: boolean;
}

interface EditAssetProps {
    asset: Asset;
    filename: string;
    options: AssetEditOptions;
}

export default function useEditAsset() {
    const [action, { error, data, loading }] = useMutation<{ editAsset: { success: boolean } }>(EDIT_ASSET);

    const editAsset = ({ asset, filename, options }: EditAssetProps) => {
        return action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id,
                filename,
                options,
            },
        });
    };

    return { editAsset, editState: data?.editAsset || null, error, loading };
}
