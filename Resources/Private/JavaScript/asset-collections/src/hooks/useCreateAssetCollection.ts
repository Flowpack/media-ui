import { useMutation } from '@apollo/client';

import { CREATE_ASSET_COLLECTION } from '../mutations/createAssetCollection';
import AssetCollection from '../interfaces/AssetCollection';
import { ASSET_COLLECTIONS } from '../queries/assetCollections';

interface CreateAssetCollectionVariables {
    title: string;
    parent: string | null;
}

export default function useCreateAssetCollection() {
    const [action, { error, data, loading }] = useMutation<
        { createAssetCollection: AssetCollection },
        CreateAssetCollectionVariables
    >(CREATE_ASSET_COLLECTION);

    const createAssetCollection = (title: string, parentCollectionId: string = null) =>
        action({
            variables: {
                title,
                parent: parentCollectionId,
            },
            update(cache, { data }) {
                const { assetCollections } = cache.readQuery<{ assetCollections: AssetCollection[] }>({
                    query: ASSET_COLLECTIONS,
                });
                cache.writeQuery({
                    query: ASSET_COLLECTIONS,
                    data: { assetCollections: assetCollections.concat([data?.createAssetCollection]) },
                });
            },
        });

    return { createAssetCollection, data, error, loading };
}
