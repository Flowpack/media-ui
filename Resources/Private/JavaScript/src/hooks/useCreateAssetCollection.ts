import { useMutation } from '@apollo/react-hooks';

import { CREATE_ASSET_COLLECTION } from '../queries';
import { AssetCollection } from '../interfaces';

interface CreateAssetCollectionVariables {
    title: string;
}

export default function useCreateAssetCollection() {
    const [action, { error, data, loading }] = useMutation<
        { assetCollection: AssetCollection },
        CreateAssetCollectionVariables
    >(CREATE_ASSET_COLLECTION);

    const createAssetCollection = (title: string, useOptimisticResponse = true) =>
        action({
            variables: {
                title
            }
            // @TODO handle it optimistically?
            // optimisticResponse: useOptimisticResponse && {
            //     assetCollection: {
            //         id: `local_${Math.random()}`,
            //         title
            //     }
            // }
        });

    return { createAssetCollection, data, error, loading };
}
