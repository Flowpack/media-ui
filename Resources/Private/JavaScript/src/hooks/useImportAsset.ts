import { useMutation } from '@apollo/react-hooks';

import { IMPORT_ASSET } from '../queries';
import { Asset } from '../interfaces';

interface ImportAssetVariables {
    id: string;
    assetSourceId: string;
}

export default function useImportAsset() {
    const [action, { error, data, loading }] = useMutation<{ importAsset: Asset }, ImportAssetVariables>(IMPORT_ASSET);

    const importAsset = (asset: Asset, useOptimisticResponse = true) =>
        action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id
            },
            optimisticResponse: useOptimisticResponse && {
                importAsset: {
                    ...asset,
                    imported: true,
                    localId: 'tmp'
                }
            }
        });

    return { importAsset, data, error, loading };
}
