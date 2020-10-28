import { useMutation } from '@apollo/react-hooks';

import { UPDATE_ASSET_COLLECTION } from '../queries';
import { AssetCollection } from '../interfaces';

interface UpdateAssetCollectionProps {
    assetCollection: AssetCollection;
    title?: string;
}

interface UpdateAssetCollectionVariables {
    id: string;
    title?: string;
}

export default function useUpdateAssetCollection() {
    const [action, { error, data, loading }] = useMutation<
        { updateAssetCollection: AssetCollection },
        UpdateAssetCollectionVariables
    >(UPDATE_ASSET_COLLECTION);

    const updateAssetCollection = ({ assetCollection, title }: UpdateAssetCollectionProps) =>
        action({
            variables: {
                id: assetCollection.id,
                title
            },
            optimisticResponse: {
                updateAssetCollection: {
                    ...assetCollection,
                    title
                }
            }
        });

    return { updateAssetCollection, data, error, loading };
}
