import { useMutation } from '@apollo/client';

import { CREATE_ASSET_COLLECTION } from '../mutations/createAssetCollection';
import { ASSET_COLLECTIONS } from '../queries/assetCollections';

interface CreateAssetCollectionVariables {
    title: AssetCollectionTitle;
    assetSourceId: AssetSourceId;
    parent: AssetCollectionId | null;
}

export default function useCreateAssetCollection() {
    const [action, { error, data, loading }] = useMutation<
        { createAssetCollection: AssetCollection },
        CreateAssetCollectionVariables
    >(CREATE_ASSET_COLLECTION);

    const createAssetCollection = (
        title: AssetCollectionTitle,
        assetSourceId: AssetSourceId,
        parentCollectionId: AssetCollectionId = null
    ) =>
        action({
            variables: {
                title,
                assetSourceId,
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
