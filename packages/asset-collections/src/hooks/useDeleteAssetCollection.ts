import { useMutation } from '@apollo/client';

import { ASSET_COLLECTIONS } from '../queries/assetCollections';
import { DELETE_ASSET_COLLECTION } from '../mutations/deleteAssetCollection';

interface DeleteAssetCollectionVariables {
    id: string;
}

export default function useDeleteAssetCollection() {
    const [action, { error, data, loading }] = useMutation<
        { deleteAssetCollection: MutationResult },
        DeleteAssetCollectionVariables
    >(DELETE_ASSET_COLLECTION);

    const deleteAssetCollection = (id: string) =>
        action({
            variables: {
                id,
            },
            optimisticResponse: {
                deleteAssetCollection: {
                    success: true,
                    messages: [],
                },
            },
            update(cache) {
                const { assetCollections } = cache.readQuery<{ assetCollections: AssetCollection[] }>({
                    query: ASSET_COLLECTIONS,
                });
                cache.writeQuery({
                    query: ASSET_COLLECTIONS,
                    data: { assetCollections: assetCollections.filter((c: AssetCollection) => c.id !== id) },
                });
            },
        });

    return { deleteAssetCollection, data, error, loading };
}
