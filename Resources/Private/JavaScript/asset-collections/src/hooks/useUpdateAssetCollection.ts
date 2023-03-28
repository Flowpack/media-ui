import { useMutation } from '@apollo/client';

import { Tag } from '@media-ui/feature-asset-tags';

import AssetCollection from '../interfaces/AssetCollection';
import UPDATE_ASSET_COLLECTION from '../mutations/updateAssetCollection';

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

    const updateAssetCollection = ({ assetCollection, title, tags, parent }: UpdateAssetCollectionProps) =>
        action({
            variables: {
                id: assetCollection.id,
                title,
                tagIds: tags?.map((tag) => tag.id),
                parent: parent?.id,
            },
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
        });

    return { updateAssetCollection, data, error, loading };
}