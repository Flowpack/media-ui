import { useMutation } from '@apollo/react-hooks';
import { useRecoilState } from 'recoil';

import { selectedTagState } from '../state';
import { Tag } from '../interfaces';
import { DELETE_TAG, TAGS } from '../queries';

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
                const { tags }: { tags: Tag[] } = proxy.readQuery({ query: TAGS });
                proxy.writeQuery({
                    query: TAGS,
                    data: {
                        tags: tags.filter(tag => tag.label !== label)
                    }
                });
            }
        }).then(success => {
            console.log(success, 'delete tag result');
            // Unselect currently selected tag if it was just deleted
            if (success && label === selectedTag?.label) {
                setSelectedTag(null);
            }
        });

    return { deleteTag, data, error };
}
