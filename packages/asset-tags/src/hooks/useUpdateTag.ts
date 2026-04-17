import { useMutation } from '@apollo/client';

import UPDATE_TAG from '../mutations/updateTag';

interface UpdateTagProps {
    tag: Tag;
    assetSourceId: AssetSourceId;
    label?: TagLabel;
}

interface UpdateTagVariables {
    id: TagId;
    assetSourceId: AssetSourceId;
    label?: TagLabel;
}

export default function useUpdateTag() {
    const [action, { error, data, loading }] = useMutation<{ updateTag: Tag }, UpdateTagVariables>(UPDATE_TAG);

    const updateTag = ({ tag, assetSourceId, label }: UpdateTagProps) =>
        action({
            variables: {
                id: tag.id,
                assetSourceId,
                label,
            },
            optimisticResponse: {
                updateTag: {
                    ...tag,
                    label,
                    ...(label
                        ? {
                              label,
                          }
                        : {}),
                },
            },
        });

    return { updateTag, data, error, loading };
}
