import { useMutation } from '@apollo/client';
import { useRecoilState } from 'recoil';

import { ASSET_COLLECTIONS } from '@media-ui/feature-asset-collections';

import selectedTagIdState from '../state/selectedTagIdState';
import TAGS from '../queries/tags';
import DELETE_TAG from '../mutations/deleteTag';

interface DeleteTagVariables {
    id: string;
}

export default function useDeleteTag() {
    const [action, { error, data }] = useMutation<{ deleteTag: MutationResult }, DeleteTagVariables>(
        DELETE_TAG
    );
    const [selectedTagId, setSelectedTagId] = useRecoilState(selectedTagIdState);

    const deleteTag = (id: string) =>
        action({
            variables: { id },
            optimisticResponse: {
                deleteTag: {
                    success: true,
                    messages: [],
                },
            },
            update: (proxy, { data: { deleteTag: success } }) => {
                if (!success) return;
                const { assetCollections } = proxy.readQuery<{ assetCollections: AssetCollection[] }>({
                    query: ASSET_COLLECTIONS,
                });
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
            if (success && id === selectedTagId) {
                setSelectedTagId(null);
            }
        });

    return { deleteTag, data, error };
}
