import { useMutation } from '@apollo/react-hooks';

import { DELETE_ASSET_COLLECTION } from '../queries';
import { AssetCollection } from '../interfaces';

interface DeleteAssetCollectionVariables {
    id: string;
}

export default function useDeleteAssetCollection() {
    const [action, { error, data, loading }] = useMutation<
        { assetCollection: AssetCollection },
        DeleteAssetCollectionVariables
    >(DELETE_ASSET_COLLECTION);

    const deleteAssetCollection = (id: string) =>
        action({
            variables: {
                id
            }
            // @TODO optimistic?
        });

    return { deleteAssetCollection, data, error, loading };
}
