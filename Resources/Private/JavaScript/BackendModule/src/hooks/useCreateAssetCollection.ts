import { useMutation } from '@apollo/react-hooks';

import { ASSET_COLLECTIONS, CREATE_ASSET_COLLECTION } from '../queries';
import { AssetCollection } from '../interfaces';

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
                title
            },
            update(cache, { data }) {
                const { assetCollections } = cache.readQuery({ query: ASSET_COLLECTIONS });
                cache.writeQuery({
                    query: ASSET_COLLECTIONS,
                    data: { assetCollections: assetCollections.concat([data?.createAssetCollection]) }
                });
            }
        });

    return { createAssetCollection, data, error, loading };
}
