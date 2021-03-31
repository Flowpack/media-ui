import { useMutation } from '@apollo/client';

import { UPDATE_ASSET_COLLECTION } from '../queries';
import { AssetCollection, Tag } from '../interfaces';

interface UpdateAssetCollectionProps {
    assetCollection: AssetCollection;
    title?: string;
    tags?: Tag[];
}

interface UpdateAssetCollectionVariables {
    id: string;
    title?: string;
    tagIds?: string[];
}

export default function useUpdateAssetCollection() {
    const [action, { error, data, loading }] = useMutation<
        { updateAssetCollection: AssetCollection },
        UpdateAssetCollectionVariables
    >(UPDATE_ASSET_COLLECTION);

    const updateAssetCollection = ({ assetCollection, title, tags }: UpdateAssetCollectionProps) =>
        action({
            variables: {
                id: assetCollection.id,
                title,
                tagIds: tags?.map(tag => tag.id)
            },
            optimisticResponse: {
                updateAssetCollection: {
                    ...assetCollection,
                    title,
                    ...(title
                        ? {
                              title
                          }
                        : {}),
                    ...(tags
                        ? {
                              tags
                          }
                        : {})
                }
            }
        });

    return { updateAssetCollection, data, error, loading };
}
