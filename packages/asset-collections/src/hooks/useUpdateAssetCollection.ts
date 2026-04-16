import { useCallback } from 'react';
import { useMutation } from '@apollo/client';

import { UPDATE_ASSET_COLLECTION } from '../mutations/updateAssetCollection';

interface UpdateAssetCollectionProps {
    assetCollection: AssetCollection;
    assetSourceId: AssetSourceId;
    title?: AssetCollectionTitle;
    tags?: Tag[];
    parent?: AssetCollection;
}

interface UpdateAssetCollectionVariables {
    id: AssetCollectionId;
    assetSourceId: AssetSourceId;
    title?: AssetCollectionTitle;
    tagIds?: TagId[];
    parent?: AssetCollectionId;
}

export default function useUpdateAssetCollection() {
    const [action, { error, data, loading }] = useMutation<
        { updateAssetCollection: AssetCollection },
        UpdateAssetCollectionVariables
    >(UPDATE_ASSET_COLLECTION);

    const updateAssetCollection = useCallback(
        ({ assetCollection, assetSourceId, title, tags, parent }: UpdateAssetCollectionProps) =>
            action({
                variables: {
                    id: assetCollection.id,
                    assetSourceId,
                    title,
                    tagIds: tags?.map((tag) => tag.id),
                    parent: parent === null ? null : parent?.id,
                },
                refetchQueries: ['ASSET_COLLECTIONS'],
                optimisticResponse: {
                    updateAssetCollection: {
                        ...assetCollection,
                        title,
                        ...(title
                            ? {
                                  title,
                              }
                            : {}),
                        ...(parent
                            ? {
                                  ...parent,
                              }
                            : {}),
                        ...(tags
                            ? {
                                  tags,
                              }
                            : {}),
                    },
                },
            }),
        [action]
    );

    return { updateAssetCollection, data, error, loading };
}
