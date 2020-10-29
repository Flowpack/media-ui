import { useMutation } from '@apollo/react-hooks';

import { UPDATE_ASSET_COLLECTION } from '../queries';
import { AssetCollection } from '../interfaces';

interface UpdateAssetCollectionProps {
    assetCollection: AssetCollection;
    title?: string;
    tagNames?: string[];
}

interface UpdateAssetCollectionVariables {
    id: string;
    title?: string;
    tagNames?: string[];
}

export default function useUpdateAssetCollection() {
    const [action, { error, data, loading }] = useMutation<
        { updateAssetCollection: AssetCollection },
        UpdateAssetCollectionVariables
    >(UPDATE_ASSET_COLLECTION);

    const updateAssetCollection = ({ assetCollection, title, tagNames }: UpdateAssetCollectionProps) =>
        action({
            variables: {
                id: assetCollection.id,
                title,
                tagNames
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
                    ...(tagNames
                        ? {
                              tags: tagNames.map(tagName => ({ label: tagName, __typename: 'Tag', children: [] }))
                          }
                        : {})
                }
            }
        });

    return { updateAssetCollection, data, error, loading };
}
