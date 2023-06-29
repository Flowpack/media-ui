import { useCallback } from 'react';
import { useMutation } from '@apollo/client';

import { UPDATE_ASSET_COLLECTION } from '../mutations/updateAssetCollection';

interface UpdateAssetCollectionProps {
    assetCollection: AssetCollection;
    title?: string;
    tags?: Tag[];
    parent?: AssetCollection;
}

interface UpdateAssetCollectionVariables {
    id: string;
    title?: string;
    tagIds?: string[];
    parent?: string;
}

export default function useUpdateAssetCollection() {
    const [action, { error, data, loading }] = useMutation<
        { updateAssetCollection: AssetCollection },
        UpdateAssetCollectionVariables
    >(UPDATE_ASSET_COLLECTION);

    const updateAssetCollection = useCallback(
        ({ assetCollection, title, tags, parent }: UpdateAssetCollectionProps) =>
            action({
                variables: {
                    id: assetCollection.id,
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
