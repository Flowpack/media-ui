import { useMutation } from '@apollo/react-hooks';

import { IMPORT_ASSET } from '../queries';
import { Asset } from '../interfaces';

interface ImportAssetVariables {
    id: string;
    assetSourceId: string;
}

export default function useImportAsset() {
    const [action, { error, data, loading }] = useMutation<{ importAsset: Asset }, ImportAssetVariables>(IMPORT_ASSET);

    const importAsset = (asset: Asset) =>
        action({
            variables: {
                id: asset.id,
                assetSourceId: asset.assetSource.id
            }
            // TODO: Find out whether we can create an optimistic response here as the local id is relevant for selection operations
        });

    return { importAsset, data, error, loading };
}
