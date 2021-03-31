import { useMutation } from '@apollo/client';

import { UPDATE_TAG } from '../queries';
import { Tag } from '../interfaces';

interface UpdateTagProps {
    tag: Tag;
    label?: string;
}

interface UpdateTagVariables {
    id: string;
    label?: string;
}

export default function useUpdateTag() {
    const [action, { error, data, loading }] = useMutation<{ updateTag: Tag }, UpdateTagVariables>(UPDATE_TAG);

    const updateTag = ({ tag, label }: UpdateTagProps) =>
        action({
            variables: {
                id: tag.id,
                label
            },
            optimisticResponse: {
                updateTag: {
                    ...tag,
                    label,
                    ...(label
                        ? {
                              label
                          }
                        : {})
                }
            }
        });

    return { updateTag, data, error, loading };
}
