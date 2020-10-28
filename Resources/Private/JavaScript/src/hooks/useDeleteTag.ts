import { useMutation } from '@apollo/react-hooks';
import { useRecoilState } from 'recoil';

import { selectedTagState } from '../state';
import { Tag } from '../interfaces';
import { ASSET_COLLECTIONS, DELETE_TAG, TAGS } from '../queries';

interface DeleteTagVariables {
    tag: string;
}

export default function useDeleteTag() {
    const [action, { error, data }] = useMutation<{ __typename: string; deleteTag: boolean }, DeleteTagVariables>(
        DELETE_TAG
    );
    const [selectedTag, setSelectedTag] = useRecoilState(selectedTagState);

    const deleteTag = ({ label }: Tag) =>
        action({
            variables: { tag: label },
            optimisticResponse: {
                __typename: 'Mutation',
                deleteTag: true
            },
            update: (proxy, { data: { deleteTag: success } }) => {
                if (!success) return;
                const { assetCollections } = proxy.readQuery({ query: ASSET_COLLECTIONS });
                const updatedAssetCollections = assetCollections.map(assetCollection => {
                    return { ...assetCollection, tags: assetCollection.tags.filter(tag => tag?.label !== label) };
                });
                proxy.writeQuery({
                    query: ASSET_COLLECTIONS,
                    data: { assetCollections: updatedAssetCollections }
                });

                const { tags }: { tags: Tag[] } = proxy.readQuery({ query: TAGS });
                proxy.writeQuery({
                    query: TAGS,
                    data: {
                        tags: tags.filter(tag => tag.label !== label)
                    }
                });
            }
        }).then(success => {
            // Unselect currently selected tag if it was just deleted
            if (success && label === selectedTag?.label) {
                setSelectedTag(null);
            }
        });

    return { deleteTag, data, error };
}
