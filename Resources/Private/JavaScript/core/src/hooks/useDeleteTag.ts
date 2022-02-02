import { useMutation } from '@apollo/client';

import { Tag } from '../interfaces';
import { ASSET_COLLECTIONS, TAGS } from '../queries';
import { DELETE_TAG } from '../mutations';
import { useSelectedTag } from './index';

interface DeleteTagVariables {
    id: string;
}

export default function useDeleteTag() {
    const [action, { error, data }] = useMutation<{ __typename: string; deleteTag: boolean }, DeleteTagVariables>(
        DELETE_TAG
    );
    const [selectedTag, setSelectedTag] = useSelectedTag();

    const deleteTag = (id: string) =>
        action({
            variables: { id },
            optimisticResponse: {
                __typename: 'Mutation',
                deleteTag: true,
            },
            update: (proxy, { data: { deleteTag: success } }) => {
                if (!success) return;
                const { assetCollections } = proxy.readQuery({ query: ASSET_COLLECTIONS });
                const updatedAssetCollections = assetCollections.map((assetCollection) => {
                    return { ...assetCollection, tags: assetCollection.tags.filter((tag) => tag?.id !== id) };
                });
                proxy.writeQuery({
                    query: ASSET_COLLECTIONS,
                    data: { assetCollections: updatedAssetCollections },
                });

                const { tags }: { tags: Tag[] } = proxy.readQuery({ query: TAGS });
                proxy.writeQuery({
                    query: TAGS,
                    data: {
                        tags: tags.filter((tag) => tag.id !== id),
                    },
                });
            },
        }).then((success) => {
            // Unselect currently selected tag if it was just deleted
            if (success && id === selectedTag?.id) {
                return setSelectedTag(null);
            }
        });

    return { deleteTag, data, error };
}
