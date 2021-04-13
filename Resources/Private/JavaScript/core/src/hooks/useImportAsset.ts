import { useMutation } from '@apollo/client';

import { IMPORT_ASSET } from '../mutations';
import { Asset } from '../interfaces';

interface ImportAssetVariables {
    id: string;
    assetSourceId: string;
}

export default function useImportAsset() {
    const [action, { error, data, loading }] = useMutation<
        { __typename: string; importAsset: Asset },
        ImportAssetVariables
    >(IMPORT_ASSET);

    const importAsset = (asset: Asset, useOptimisticResponse = true) =>
        action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id,
            },
            optimisticResponse: useOptimisticResponse && {
                __typename: 'Mutation',
                importAsset: {
                    ...asset,
                    imported: true,
                    localId: 'tmp',
                },
            },
        });

    return { importAsset, data, error, loading };
}
