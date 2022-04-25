import { useMutation } from '@apollo/client';

import { Tag } from '../interfaces';
import { ASSET_COLLECTIONS, TAGS } from '../queries';
import { CREATE_TAG } from '../mutations';

interface CreateTagVariables {
    label: string;
    assetCollectionId?: string;
}

export default function useCreateTag() {
    const [action, { error, data }] = useMutation<{ __typename: string; createTag: Tag }, CreateTagVariables>(
        CREATE_TAG
    );

    const createTag = (label: string, assetCollectionId?: string) =>
        action({
            variables: { label, assetCollectionId },
            // FIXME: Optimistic response has to be adjusted as we don't know the id of the created tag
            // optimisticResponse: {
            //     __typename: 'Mutation',
            //     createTag: {
            //         __typename: 'Tag',
            //         label: label,
            //     }
            // },
            update: (proxy, { data: { createTag: newTag } }) => {
                const { assetCollections } = proxy.readQuery({ query: ASSET_COLLECTIONS });
                const updatedAssetCollections = assetCollections.map((assetCollection) => {
                    if (assetCollection.id === assetCollectionId) {
                        return { ...assetCollection, tags: [...assetCollection.tags, newTag] };
                    }
                    return assetCollection;
                });
                proxy.writeQuery({
                    query: ASSET_COLLECTIONS,
                    data: { assetCollections: updatedAssetCollections },
                });

                const { tags } = proxy.readQuery({ query: TAGS });
                if (!tags.find((tag) => tag?.label === newTag?.label)) {
                    proxy.writeQuery({
                        query: TAGS,
                        data: {
                            tags: [...tags, newTag],
                        },
                    });
                }
            },
        });

    return { createTag, data, error };
}
