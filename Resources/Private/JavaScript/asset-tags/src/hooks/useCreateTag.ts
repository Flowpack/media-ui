import { useMutation } from '@apollo/client';

import { ASSET_COLLECTIONS, AssetCollection } from '@media-ui/feature-asset-collections';

import Tag from '../interfaces/Tag';
import TAGS from '../queries/tags';
import CREATE_TAG from '../mutations/createTag';

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
                const { assetCollections } = proxy.readQuery<{ assetCollections: AssetCollection[] }>({
                    query: ASSET_COLLECTIONS,
                });
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

                const { tags } = proxy.readQuery<{ tags: Tag[] }>({ query: TAGS });
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
