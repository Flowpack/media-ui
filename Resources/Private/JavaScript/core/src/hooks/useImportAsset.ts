import { useMutation } from '@apollo/client';

import { IMPORT_ASSET } from '../mutations';

interface ImportAssetVariables {
    id: string;
    assetSourceId: string;
}

export default function useImportAsset() {
    const [action, { error, data, loading }] = useMutation<
        { __typename: string; importAsset: Asset },
        ImportAssetVariables
    >(IMPORT_ASSET);

    const importAsset = (assetIdentity: AssetIdentity) =>
        action({
            variables: {
                id: assetIdentity.assetId,
                assetSourceId: assetIdentity.assetSourceId,
            },
        });

    return { importAsset, data, error, loading };
}
