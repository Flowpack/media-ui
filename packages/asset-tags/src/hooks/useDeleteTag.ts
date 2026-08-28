import { useMutation } from '@apollo/client';
import { useRecoilState, useRecoilValue } from 'recoil';

import { ASSET_COLLECTIONS } from '@media-ui/feature-asset-collections';
import { selectedAssetSourceIdState } from '@media-ui/feature-asset-sources';

import selectedTagIdState from '../state/selectedTagIdState';
import TAGS from '../queries/tags';
import DELETE_TAG from '../mutations/deleteTag';

interface DeleteTagVariables {
    id: TagId;
    assetSourceId: AssetSourceId;
}

export default function useDeleteTag() {
    const [action, { error, data }] = useMutation<{ deleteTag: MutationResult }, DeleteTagVariables>(DELETE_TAG);
    const assetSourceId = useRecoilValue(selectedAssetSourceIdState);
    const [selectedTagId, setSelectedTagId] = useRecoilState(selectedTagIdState(assetSourceId));

    const deleteTag = (id: TagId, assetSourceId: AssetSourceId) =>
        action({
            variables: { id, assetSourceId },
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
                    variables: { assetSourceId },
                });
                const updatedAssetCollections = assetCollections.map((assetCollection) => {
                    return { ...assetCollection, tags: assetCollection.tags.filter((tag) => tag?.id !== id) };
                });
                proxy.writeQuery({
                    query: ASSET_COLLECTIONS,
                    variables: { assetSourceId },
                    data: { assetCollections: updatedAssetCollections },
                });

                const { tags }: { tags: Tag[] } = proxy.readQuery({
                    query: TAGS,
                    variables: { assetSourceId },
                });
                proxy.writeQuery({
                    query: TAGS,
                    variables: { assetSourceId },
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
