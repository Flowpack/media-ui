import { useMutation } from '@apollo/react-hooks';

import { Tag } from '../interfaces';
import { CREATE_TAG, TAGS } from '../queries';

interface CreateTagVariables {
    label: string;
}

export default function useCreateTag() {
    const [action, { error, data }] = useMutation<{ __typename: string; createTag: Tag }, CreateTagVariables>(
        CREATE_TAG
    );

    const createTag = ({ label }: Tag) =>
        action({
            variables: { label },
            optimisticResponse: {
                __typename: 'Mutation',
                createTag: {
                    __typename: 'Tag',
                    label: label,
                    parent: null,
                    children: []
                }
            },
            update: (proxy, { data: { createTag: newTag } }) => {
                const { tags } = proxy.readQuery({ query: TAGS });
                proxy.writeQuery({
                    query: TAGS,
                    data: {
                        tags: [...tags, newTag]
                    }
                });
            }
        });

    return { createTag, data, error };
}
