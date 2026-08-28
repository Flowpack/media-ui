import { useMutation } from '@apollo/client';

import { ASSET_COLLECTIONS } from '@media-ui/feature-asset-collections';

import TAGS from '../queries/tags';
import CREATE_TAG from '../mutations/createTag';

interface CreateTagVariables {
    label: TagLabel;
    assetSourceId: AssetSourceId;
    assetCollectionId?: AssetCollectionId;
}

export default function useCreateTag() {
    const [action, { error, data }] = useMutation<{ __typename: string; createTag: Tag }, CreateTagVariables>(
        CREATE_TAG
    );

    const createTag = (label: TagLabel, assetSourceId: AssetSourceId, assetCollectionId?: AssetCollectionId) =>
        action({
            variables: { label, assetSourceId, assetCollectionId },
            // FIXME: Optimistic response has to be adjusted as we don't know the id of the created tag
            // optimisticResponse: {
            //     __typename: 'Mutation',
            //     createTag: {
            //         __typename: 'Tag',
            //         label: label,
            //     }
            // },
            update: (proxy, { data }) => {
                const newTag = data?.createTag;
                const assetCollections =
                    proxy.readQuery<{ assetCollections: AssetCollection[] }>({
                        query: ASSET_COLLECTIONS,
                        variables: {
                            assetSourceId,
                        },
                    })?.assetCollections || [];
                const updatedAssetCollections = assetCollections.map((assetCollection) => {
                    if (assetCollection.id === assetCollectionId) {
                        const existingTags = assetCollection.tags || [];
                        return { ...assetCollection, tags: [...existingTags, newTag] };
                    }
                    return assetCollection;
                });
                proxy.writeQuery({
                    query: ASSET_COLLECTIONS,
                    variables: {
                        assetSourceId,
                    },
                    data: { assetCollections: updatedAssetCollections },
                });

                const tags =
                    proxy.readQuery<{ tags: Tag[] }>({
                        query: TAGS,
                        variables: {
                            assetSourceId,
                        },
                    })?.tags || [];
                if (!tags.find((tag) => tag?.label === newTag?.label)) {
                    proxy.writeQuery({
                        query: TAGS,
                        variables: {
                            assetSourceId,
                        },
                        data: {
                            tags: [...tags, newTag],
                        },
                    });
                }
            },
        });

    return { createTag, data, error };
}
