import { useMutation } from '@apollo/client';

import { ASSET_COLLECTIONS } from '../queries';
import { AssetCollection } from '../interfaces';
import { CREATE_ASSET_COLLECTION } from '../mutations';

interface CreateAssetCollectionVariables {
    title: string;
}

export default function useCreateAssetCollection() {
    const [action, { error, data, loading }] = useMutation<
        { createAssetCollection: AssetCollection },
        CreateAssetCollectionVariables
    >(CREATE_ASSET_COLLECTION);

    const createAssetCollection = (title: string) =>
        action({
            variables: {
                title,
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
